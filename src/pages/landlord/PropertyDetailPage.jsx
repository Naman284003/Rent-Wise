import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatINR, formatDateIN } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteRoomId, setDeleteRoomId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [rentAmount, setRentAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [status, setStatus] = useState('vacant');
  const [facilities, setFacilities] = useState('');
  const [description, setDescription] = useState('');

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/properties/${id}`);
      if (res.data.success) {
        setPropertyData(res.data.property);
      }
    } catch (err) {
      console.error('Failed to load property details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetail();
  }, [id]);

  const openCreateRoomModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setFloor(1);
    setRentAmount('');
    setDepositAmount('');
    setStatus('vacant');
    setFacilities('');
    setDescription('');
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setFloor(room.floor || 1);
    setRentAmount(room.rentAmount);
    setDepositAmount(room.depositAmount || 0);
    setStatus(room.status || 'vacant');
    setFacilities(Array.isArray(room.facilities) ? room.facilities.join(', ') : '');
    setDescription(room.description || '');
    setIsRoomModalOpen(true);
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
        propertyId: id,
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
          setIsRoomModalOpen(false);
          fetchPropertyDetail();
        }
      } else {
        const res = await api.post('/rooms', payload);
        if (res.data.success) {
          toast.success('Flat added');
          setIsRoomModalOpen(false);
          fetchPropertyDetail();
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
        fetchPropertyDetail();
      }
    } catch (err) {
      // Handled by api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader rows={2} />
        <SkeletonLoader rows={6} />
      </div>
    );
  }

  if (!propertyData) {
    return (
      <EmptyState
        title="Property not found"
        description="This property does not exist or you do not have access to it."
        actionLabel="Back to Properties"
        onAction={() => window.history.back()}
      />
    );
  }

  const defaultImg = '/assets/images/indian_residency_hero_1795086777363.jpg';
  const displayImg = (propertyData.images && propertyData.images[0]) || defaultImg;
  const stats = propertyData.stats || { totalRooms: 0, occupiedRooms: 0, vacantRooms: 0, occupancyRate: 0 };
  const rooms = propertyData.rooms || [];
  const activeLeases = propertyData.activeLeases || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/landlord/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Link>
        <button
          type="button"
          onClick={openCreateRoomModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Flat / Room</span>
        </button>
      </div>

      {/* Overview Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 h-60 lg:h-auto bg-slate-100 dark:bg-slate-800">
          <img
            src={displayImg}
            alt={propertyData.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:col-span-7 p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {propertyData.propertyType} · {stats.occupancyRate}% occupied
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
              {propertyData.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {propertyData.address}, {propertyData.city}, {propertyData.state} — {propertyData.zipCode}
            </p>

            {propertyData.description && (
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {propertyData.description}
              </p>
            )}

            {propertyData.amenities && propertyData.amenities.length > 0 && (
              <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Amenities: </span>
                {propertyData.amenities.join(' · ')}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Total Flats</span>
              <span className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">{stats.totalRooms}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Occupied</span>
              <span className="font-display text-lg font-bold text-teal-700 dark:text-teal-400 tabular-nums">{stats.occupiedRooms}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Vacant</span>
              <span className="font-display text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{stats.vacantRooms}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flats Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
              Flats & Rooms
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monthly rent, security deposit, and availability
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Flat #</th>
                <th className="px-5 py-3 font-semibold">Floor</th>
                <th className="px-5 py-3 font-semibold text-right">Monthly Rent</th>
                <th className="px-5 py-3 font-semibold text-right">Deposit</th>
                <th className="px-5 py-3 font-semibold">Details</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No flats added to this building yet.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      Flat {room.roomNumber}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 tabular-nums">
                      Floor {room.floor}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatINR(room.rentAmount)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-500 tabular-nums">
                      {formatINR(room.depositAmount)}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {room.facilities?.length > 0 ? room.facilities.join(' · ') : 'Standard'}
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={room.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditRoomModal(room)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Agreements */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100">
              Current Tenants
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active rental agreements in {propertyData.name}
            </p>
          </div>
          <Link
            to="/landlord/tenants"
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
          >
            Manage Leases
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Tenant</th>
                <th className="px-5 py-3 font-semibold">Flat</th>
                <th className="px-5 py-3 font-semibold text-right">Monthly Rent</th>
                <th className="px-5 py-3 font-semibold">Agreement Period</th>
                <th className="px-5 py-3 font-semibold">Due Day</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeLeases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No active tenants in this building right now.
                  </td>
                </tr>
              ) : (
                activeLeases.map((lease) => (
                  <tr key={lease._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{lease.tenant?.name}</div>
                      <div className="text-[11px] text-slate-500">{lease.tenant?.phone || lease.tenant?.email}</div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-teal-700 dark:text-teal-400">
                      Flat {lease.room?.roomNumber}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatINR(lease.monthlyRent)}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatDateIN(lease.leaseStart)} – {formatDateIN(lease.leaseEnd)}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                      {lease.rentDueDate}th of month
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={lease.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Flat Modal */}
      <Modal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        title={editingRoom ? `Edit Flat ${editingRoom.roomNumber}` : 'Add Flat / Room'}
        subtitle={propertyData.name}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Flat / Room Number *
              </label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. A-101, 402"
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
              Availability Status
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
              Flat Features (comma separated)
            </label>
            <input
              type="text"
              value={facilities}
              onChange={(e) => setFacilities(e.target.value)}
              placeholder="2BHK, Modular Kitchen, Geyser, Split AC"
              className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
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
        message="Only vacant flats without active tenant agreements can be deleted."
        confirmText="Delete"
        isDestructive={true}
        loading={submitting}
      />
    </div>
  );
}
