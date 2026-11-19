import bcrypt from 'bcryptjs';

// In-memory collections map with dynamic auto-vivification
const store = {};

function getCollection(name) {
  const key = String(name).toLowerCase();
  if (!store[key]) {
    store[key] = new Map();
  }
  return store[key];
}

function generateId() {
  return '65' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 16);
}

function matchesFilter(item, filter = {}) {
  for (const [key, val] of Object.entries(filter)) {
    if (val === undefined) continue;

    const itemVal = item[key];

    // Handle $or
    if (key === '$or' && Array.isArray(val)) {
      const anyMatch = val.some(subFilter => matchesFilter(item, subFilter));
      if (!anyMatch) return false;
      continue;
    }

    // Handle operator objects e.g. { $in: [...] }, { $ne: ... }, { $regex: ... }
    if (val && typeof val === 'object' && !(val instanceof RegExp) && !(val instanceof Date)) {
      if ('$in' in val && Array.isArray(val.$in)) {
        const itemValStr = String(itemVal?._id || itemVal || '');
        const inMatch = val.$in.some(v => String(v?._id || v) === itemValStr);
        if (!inMatch) return false;
        continue;
      }
      if ('$ne' in val) {
        if (String(itemVal?._id || itemVal) === String(val.$ne)) return false;
        continue;
      }
      if ('$regex' in val) {
        const reg = new RegExp(val.$regex, val.$options || 'i');
        if (!reg.test(String(itemVal || ''))) return false;
        continue;
      }
      if ('$gte' in val && Number(itemVal) < Number(val.$gte)) return false;
      if ('$lte' in val && Number(itemVal) > Number(val.$lte)) return false;
    }

    // Regular field equality
    const left = String(itemVal?._id || itemVal || '');
    const right = String(val?._id || val || '');
    if (left !== right) return false;
  }
  return true;
}

class QueryCursor {
  constructor(collectionKey, items) {
    this.collectionKey = collectionKey;
    this.items = items;
    this._populateFields = [];
    this._sortObj = null;
    this._limitNum = null;
    this._skipNum = 0;
  }

  populate(field, select) {
    if (typeof field === 'string') {
      this._populateFields.push({ path: field, select });
    } else if (typeof field === 'object' && field.path) {
      this._populateFields.push(field);
    }
    return this;
  }

  sort(sortObj) {
    this._sortObj = sortObj;
    return this;
  }

  skip(n) {
    this._skipNum = Number(n) || 0;
    return this;
  }

  limit(n) {
    this._limitNum = Number(n) || null;
    return this;
  }

  async exec() {
    let result = [...this.items];

    if (this._sortObj) {
      const [key, dir] = Object.entries(this._sortObj)[0] || [];
      if (key) {
        const factor = dir === -1 || dir === 'desc' ? -1 : 1;
        result.sort((a, b) => {
          const valA = a[key] instanceof Date ? a[key].getTime() : a[key];
          const valB = b[key] instanceof Date ? b[key].getTime() : b[key];
          if (valA < valB) return -1 * factor;
          if (valA > valB) return 1 * factor;
          return 0;
        });
      }
    }

    if (this._skipNum > 0) {
      result = result.slice(this._skipNum);
    }

    if (this._limitNum !== null && this._limitNum > 0) {
      result = result.slice(0, this._limitNum);
    }

    // Populate references
    for (const pop of this._populateFields) {
      result = result.map(item => this._populateItem(item, pop.path));
    }

    return result.map(item => wrapDocument(this.collectionKey, item));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  _populateItem(item, path) {
    const cloned = { ...item };
    const refId = cloned[path];
    if (!refId) return cloned;

    // determine target collection
    let targetCollKey = null;
    if (path === 'landlord' || path === 'tenant' || path === 'user' || path === 'recordedBy') targetCollKey = 'user';
    else if (path === 'property') targetCollKey = 'property';
    else if (path === 'room') targetCollKey = 'room';
    else if (path === 'assignment') targetCollKey = 'tenantassignment';
    else if (path === 'rentRecord') targetCollKey = 'rentrecord';

    if (targetCollKey) {
      const targetMap = getCollection(targetCollKey);
      const idStr = String(refId?._id || refId);
      const found = targetMap.get(idStr);
      if (found) {
        const foundDoc = { ...found };
        delete foundDoc.password; // safety
        cloned[path] = wrapDocument(targetCollKey, foundDoc);
      }
    }
    return cloned;
  }
}

function wrapDocument(collectionKey, data) {
  if (!data) return null;
  const doc = { ...data };

  // Helper methods
  doc.toObject = () => ({ ...doc });
  doc.toJSON = () => {
    const copy = { ...doc };
    delete copy.password;
    return copy;
  };

  doc.save = async function () {
    this.updatedAt = new Date();
    getCollection(collectionKey).set(this._id, { ...this });
    return this;
  };

  if (collectionKey.includes('user')) {
    doc.comparePassword = async function (enteredPassword) {
      if (!this.password) return false;
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  return doc;
}

export function createMemoryModel(collectionKey) {
  const coll = getCollection(collectionKey);

  return {
    async create(data) {
      const items = Array.isArray(data) ? data : [data];
      const createdDocs = [];

      for (const item of items) {
        const id = item._id ? String(item._id) : generateId();
        const now = new Date();
        const docData = {
          ...item,
          _id: id,
          createdAt: item.createdAt || now,
          updatedAt: item.updatedAt || now,
        };

        // Password hash if user
        if (collectionKey.includes('user') && docData.password && !docData.password.startsWith('$2')) {
          const salt = await bcrypt.genSalt(10);
          docData.password = await bcrypt.hash(docData.password, salt);
        }

        coll.set(id, docData);
        createdDocs.push(wrapDocument(collectionKey, docData));
      }

      return Array.isArray(data) ? createdDocs : createdDocs[0];
    },

    find(filter = {}) {
      const matches = [];
      for (const item of coll.values()) {
        if (matchesFilter(item, filter)) {
          matches.push({ ...item });
        }
      }
      return new QueryCursor(collectionKey, matches);
    },

    findOne(filter = {}) {
      let found = null;
      for (const item of coll.values()) {
        if (matchesFilter(item, filter)) {
          found = { ...item };
          break;
        }
      }
      const cursor = new QueryCursor(collectionKey, found ? [found] : []);
      const origExec = cursor.exec.bind(cursor);
      cursor.exec = async () => {
        const res = await origExec();
        return res[0] || null;
      };
      return cursor;
    },

    findById(id) {
      const idStr = String(id?._id || id);
      const found = coll.get(idStr);
      const cursor = new QueryCursor(collectionKey, found ? [{ ...found }] : []);
      const origExec = cursor.exec.bind(cursor);
      cursor.exec = async () => {
        const res = await origExec();
        return res[0] || null;
      };
      return cursor;
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      const idStr = String(id?._id || id);
      const existing = coll.get(idStr);
      if (!existing) return null;

      const updated = {
        ...existing,
        ...update,
        updatedAt: new Date(),
      };

      if (collectionKey.includes('user') && update.password && !update.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        updated.password = await bcrypt.hash(update.password, salt);
      }

      coll.set(idStr, updated);
      return wrapDocument(collectionKey, updated);
    },

    async findByIdAndDelete(id) {
      const idStr = String(id?._id || id);
      const existing = coll.get(idStr);
      if (existing) {
        coll.delete(idStr);
        return wrapDocument(collectionKey, existing);
      }
      return null;
    },

    async countDocuments(filter = {}) {
      let count = 0;
      for (const item of coll.values()) {
        if (matchesFilter(item, filter)) count++;
      }
      return count;
    },

    async deleteMany(filter = {}) {
      let deleted = 0;
      for (const [id, item] of coll.entries()) {
        if (matchesFilter(item, filter)) {
          coll.delete(id);
          deleted++;
        }
      }
      return { deletedCount: deleted };
    },

    clear() {
      coll.clear();
    },
  };
}

export const memoryStore = store;
