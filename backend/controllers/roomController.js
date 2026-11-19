import { Room } from '../models/Room.js';
import { Property } from '../models/Property.js';
import { TenantAssignment } from '../models/TenantAssignment.js';

// @desc    Get rooms (optionally filtered by property or status)
// @route   GET /api/rooms
export const getRooms = async (req, res, next) => {
  try {
    const { propertyId, status, search } = req.query;

    const filter = {};
    if (req.user.role === 'landlord') {
      filter.landlord = req.user._id;
    }
    if (propertyId && propertyId !== 'all') {
      filter.property = propertyId;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.roomNumber = { $regex: search, $options: 'i' };
    }

    const rooms = await Room.find(filter)
      .populate('property', 'name address city propertyType')
      .sort({ roomNumber: 1 });

    // Augment with active lease/tenant details if occupied
    const augmentedRooms = await Promise.all(
      rooms.map(async (r) => {
        const roomObj = r.toObject ? r.toObject() : { ...r };
        if (roomObj.status === 'occupied') {
          const activeAssignment = await TenantAssignment.findOne({
            room: r._id,
            status: 'active',
          }).populate('tenant', 'name email phone avatar');

          return {
            ...roomObj,
            activeAssignment,
          };
        }
        return roomObj;
      })
    );

    res.status(200).json({
      success: true,
      count: augmentedRooms.length,
      rooms: augmentedRooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('property', 'name address city state zipCode propertyType landlord')
      .populate('landlord', 'name email phone');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Ownership check
    if (req.user.role === 'landlord' && String(room.landlord?._id || room.landlord) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view rooms belonging to other landlords.',
      });
    }

    const activeAssignment = await TenantAssignment.findOne({
      room: room._id,
      status: 'active',
    }).populate('tenant', 'name email phone avatar emergencyContact');

    const roomObj = room.toObject ? room.toObject() : { ...room };

    res.status(200).json({
      success: true,
      room: {
        ...roomObj,
        activeAssignment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new room under a property
// @route   POST /api/rooms
export const createRoom = async (req, res, next) => {
  try {
    const { propertyId, roomNumber, floor, rentAmount, depositAmount, facilities, status, description } = req.body;

    if (!propertyId || !roomNumber || rentAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Property, room number, and rent amount are required.',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Parent property not found.',
      });
    }

    // Ownership check
    if (req.user.role === 'landlord' && String(property.landlord?._id || property.landlord) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only add rooms to properties that you own.',
      });
    }

    // Check duplicate room number in the same property
    const duplicate = await Room.findOne({
      property: propertyId,
      roomNumber: roomNumber.trim(),
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Room/Unit '${roomNumber}' already exists in this property.`,
      });
    }

    const room = await Room.create({
      property: propertyId,
      landlord: property.landlord,
      roomNumber: roomNumber.trim(),
      floor: floor || 1,
      rentAmount: Number(rentAmount),
      depositAmount: depositAmount !== undefined ? Number(depositAmount) : 0,
      facilities: Array.isArray(facilities) ? facilities : [],
      status: status || 'vacant',
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Room unit created successfully.',
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    if (req.user.role === 'landlord' && String(room.landlord?._id || room.landlord) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update rooms in properties that you own.',
      });
    }

    const { roomNumber, floor, rentAmount, depositAmount, facilities, status, description } = req.body;

    // If changing room number, check duplicates
    if (roomNumber && roomNumber.trim() !== room.roomNumber) {
      const duplicate = await Room.findOne({
        property: room.property,
        roomNumber: roomNumber.trim(),
        _id: { $ne: room._id },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Room/Unit '${roomNumber}' already exists in this property.`,
        });
      }
    }

    // Prevent manually marking occupied room as vacant if active lease exists
    if (status === 'vacant' && room.status === 'occupied') {
      const active = await TenantAssignment.findOne({ room: room._id, status: 'active' });
      if (active) {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark room as vacant while an active tenant lease assignment is in effect. Please terminate the lease first.',
        });
      }
    }

    const updated = await Room.findByIdAndUpdate(
      room._id,
      {
        ...(roomNumber ? { roomNumber: roomNumber.trim() } : {}),
        ...(floor !== undefined ? { floor: Number(floor) } : {}),
        ...(rentAmount !== undefined ? { rentAmount: Number(rentAmount) } : {}),
        ...(depositAmount !== undefined ? { depositAmount: Number(depositAmount) } : {}),
        ...(facilities !== undefined ? { facilities } : {}),
        ...(status ? { status } : {}),
        ...(description !== undefined ? { description } : {}),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Room updated successfully.',
      room: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    if (req.user.role === 'landlord' && String(room.landlord?._id || room.landlord) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete rooms in properties that you own.',
      });
    }

    if (room.status === 'occupied') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an occupied room unit. Terminate the active tenant lease first.',
      });
    }

    await Room.findByIdAndDelete(room._id);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
