import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatINR } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { DoorOpen, Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [propertyFilter, setPropertyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteRoomId, setDeleteRoomId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPropId, setSelectedPropId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [rentAmount, setRentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [status, setStatus] = useState('vacant');
  const [facilities, setFacilities] = useState('');
  const [description, setDescription] = useState('');

  const fetchRoomsAndProps = async () => {
    try {
      setLoading(true);
      const [roomsRes, propsRes] = await Promise.all([
        api.get('/rooms', {
          params: { propertyId: propertyFilter, status: statusFilter, search },
        }),
        api.get('/properties'),
      ]);

      if (roomsRes.data.success) {
        setRooms(roomsRes.data.rooms);
      }
      if (propsRes.data.success) {
        setProperties(propsRes.data.properties);
        if (!selectedPropId && propsRes.data.properties.length > 0) {
          setSelectedPropId(propsRes.data.properties[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load flats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndProps();
  }, [propertyFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRoomsAndProps();
  };

  const openCreateModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setFloor(1);
    setRentAmount('');
    setDepositAmount('');
    setStatus('vacant');
    setFacilities('');
    setDescription('');
    if (properties.length > 0 && !selectedPropId) {
      setSelectedPropId(properties[0]._id);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setSelectedPropId(room.property?._id || room.property);
    setRoomNumber(room.roomNumber);
    setFloor(room.floor || 1);
    setRentAmount(room.rentAmount);
    setDepositAmount(room.depositAmount || 0);
    setStatus(room.status || 'vacant');
    setFacilities(Array.isArray(room.facilities) ? room.facilities.join(', ') : '');
    setDescription(room.description || '');
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const facilitiesArray = facilities
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        propertyId: selectedPropId,
        roomNumber,
        floor: Number(floor),
        rentAmount: Number(rentAmount),
        depositAmount: Number(depositAmount || rentAmount * 3),
        facilities: facilitiesArray,
        status,
        description,
      };

      if (editingRoom) {
        const res = await api.put(`/rooms/${editingRoom._id}`, payload);
        if (res.data.success) {
          toast.success('Flat updated');
          setIsModalOpen(false);
          fetchRoomsAndProps();
        }
      } else {
        const res = await api.post('/rooms', payload);
        if (res.data.success) {
          toast.success('Flat added');
          setIsModalOpen(false);
          fetchRoomsAndProps();
        }
      }
    } catch (err) {
      // Handled by api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteRoomId) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/rooms/${deleteRoomId}`);
      if (res.data.success) {
        toast.success('Flat removed');
        setDeleteRoomId(null);
        fetchRoomsAndProps();
      }
    } catch (err) {
      // Handled by api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Flats & Rooms
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track monthly rent, deposits, and current occupancy for every flat.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={properties.length === 0}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Flat</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flat number (e.g. A-204, 401)..."
            className="w-full pl-9 pr-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
          >
            <option value="all">All Properties</option>
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader rows={5} />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No flats found"
          description="No flats match the current filters."
          actionLabel={properties.length > 0 ? 'Add Flat' : undefined}
          onAction={properties.length > 0 ? openCreateModal : undefined}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Flat #</th>
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold text-right">Monthly Rent</th>
                  <th className="px-5 py-3 font-semibold text-right">Deposit</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Current Tenant</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rooms.map((room) => {
                  const activeTenant = room.activeAssignment?.tenant;
                  return (
                    <tr key={room._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Flat {room.roomNumber}</div>
                        <div className="text-[11px] text-slate-500">Floor {room.floor}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{room.property?.name}</div>
                        <div className="text-[11px] text-slate-500">{room.property?.city}</div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatINR(room.rentAmount)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-slate-500 tabular-nums">
                        {formatINR(room.depositAmount)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={room.status} />
                      </td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                        {activeTenant ? activeTenant.name : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(room)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-md cursor-pointer"
                            title="Edit flat"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteRoomId(room._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-md cursor-pointer"
                            title="Delete flat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? `Edit Flat ${editingRoom.roomNumber}` : 'Add Flat / Room'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Property *
            </label>
            <select
              value={selectedPropId}
              onChange={(e) => setSelectedPropId(e.target.value)}
              disabled={!!editingRoom}
              className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-60"
            >
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Flat Number *
              </label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. A-204"
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Floor *
              </label>
              <input
                type="number"
                required
                min={0}
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Rent (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder="25000"
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                min={0}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="75000"
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Under Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Features (comma separated)
            </label>
            <input
              type="text"
              value={facilities}
              onChange={(e) => setFacilities(e.target.value)}
              placeholder="2BHK, Modular Kitchen, Geyser, Split AC"
              className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Add Flat'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteRoomId}
        onClose={() => setDeleteRoomId(null)}
        onConfirm={handleDeleteRoom}
        title="Delete flat?"
        message="Occupied flats cannot be deleted until the tenant agreement is closed."
        confirmText="Delete"
        isDestructive={true}
        loading={submitting}
      />
    </div>
  );
}
