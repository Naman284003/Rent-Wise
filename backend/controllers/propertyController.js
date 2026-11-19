import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { TenantAssignment } from '../models/TenantAssignment.js';

// @desc    Get all properties (scoped to landlord, or all for admin)
// @route   GET /api/properties
export const getProperties = async (req, res, next) => {
  try {
    const { search, type, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (req.user.role === 'landlord') {
      filter.landlord = req.user._id;
    }
    if (type && type !== 'all') {
      filter.propertyType = type;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const properties = await Property.find(filter)
      .populate('landlord', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Augment with room statistics for each property
    const propertiesWithStats = await Promise.all(
      properties.map(async (prop) => {
        const propObj = prop.toObject ? prop.toObject() : { ...prop };
        const rooms = await Room.find({ property: prop._id });
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
        const vacantRooms = rooms.filter(r => r.status === 'vacant').length;
        const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;

        return {
          ...propObj,
          stats: {
            totalRooms,
            occupiedRooms,
            vacantRooms,
            maintenanceRooms,
            occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
          },
        };
      })
    );

    const total = await Property.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: propertiesWithStats.length,
      total,
      properties: propertiesWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
export const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('landlord', 'name email phone avatar');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Authorization check: Landlord can only view their own property
    if (req.user.role === 'landlord' && String(property.landlord?._id || property.landlord) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view properties belonging to other landlords.',
      });
    }

    const rooms = await Room.find({ property: property._id });
    const assignments = await TenantAssignment.find({ property: property._id, status: 'active' })
      .populate('tenant', 'name email phone avatar')
      .populate('room', 'roomNumber');

    const propObj = property.toObject ? property.toObject() : { ...property };
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const vacantRooms = rooms.filter(r => r.status === 'vacant').length;

    res.status(200).json({
      success: true,
      property: {
        ...propObj,
        rooms,
        activeLeases: assignments,
        stats: {
          totalRooms,
          occupiedRooms,
          vacantRooms,
          occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property (Landlord or Admin)
// @route   POST /api/properties
export const createProperty = async (req, res, next) => {
  try {
    const { name, address, city, state, zipCode, propertyType, description, amenities, images } = req.body;

    if (!name || !address || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, city, state, and zipCode are required fields.',
      });
    }

    const landlordId = req.user.role === 'admin' && req.body.landlordId ? req.body.landlordId : req.user._id;

    const property = await Property.create({
      landlord: landlordId,
      name,
      address,
      city,
      state,
      zipCode,
      propertyType: propertyType || 'apartment',
      description: description || '',
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) && images.length > 0 ? images : ['/assets/images/indian_residency_hero_1795086777363.jpg'],
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property (Landlord owner or Admin)
// @route   PUT /api/properties/:id
export const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Ownership check
    if (req.user.role === 'landlord' && String(property.landlord?._id || property.landlord) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update properties that you own.',
      });
    }

    const { name, address, city, state, zipCode, propertyType, description, amenities, images } = req.body;

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name } : {}),
        ...(address ? { address } : {}),
        ...(city ? { city } : {}),
        ...(state ? { state } : {}),
        ...(zipCode ? { zipCode } : {}),
        ...(propertyType ? { propertyType } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(amenities !== undefined ? { amenities } : {}),
        ...(images !== undefined ? { images } : {}),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      property: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
export const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    if (req.user.role === 'landlord' && String(property.landlord?._id || property.landlord) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete properties that you own.',
      });
    }

    // Check if any rooms are occupied
    const occupiedRoom = await Room.findOne({ property: property._id, status: 'occupied' });
    if (occupiedRoom) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete property with currently occupied rooms. Please terminate leases first.',
      });
    }

    await Room.deleteMany({ property: property._id });
    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property and its associated rooms were deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
