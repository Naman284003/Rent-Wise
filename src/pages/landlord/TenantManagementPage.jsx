import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';
import { formatINR, formatDateIN } from '../../utils/formatters.js';
import { Users, Plus, Search } from 'lucide-react';

export default function TenantManagementPage() {
  const [assignments, setAssignments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('active');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [terminateId, setTerminateId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPropId, setSelectedPropId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [rentDueDate, setRentDueDate] = useState(5);
  const [monthlyRent, setMonthlyRent] = useState('');
  const [depositPaid, setDepositPaid] = useState('');
  const [notes, setNotes] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments', {
        params: { status: statusFilter, propertyId: propertyFilter, search },
      });
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPropertiesAndAvailable = async () => {
    try {
      const [propRes, tenantRes] = await Promise.all([
        api.get('/properties'),
        api.get('/users/tenants', { params: { availableOnly: 'true' } }),
      ]);
      if (propRes.data.success) {
        setProperties(propRes.data.properties);
        if (propRes.data.properties.length > 0) {
          const firstProp = selectedPropId || propRes.data.properties[0]._id;
          setSelectedPropId(firstProp);
          loadVacantRoomsForProp(firstProp);
        }
      }
      if (tenantRes.data.success) {
        setAvailableTenants(tenantRes.data.tenants);
        if (tenantRes.data.tenants.length > 0) {
          setSelectedTenantId(tenantRes.data.tenants[0]._id);
        } else {
          setSelectedTenantId('');
        }
      }
    } catch (err) {
      console.error('Failed to load properties or tenants:', err);
    }
  };

  const loadVacantRoomsForProp = async (propId) => {
    try {
      const res = await api.get('/rooms', {
        params: { propertyId: propId, status: 'vacant' },
      });
      if (res.data.success) {
        setVacantRooms(res.data.rooms);
        if (res.data.rooms.length > 0) {
          setSelectedRoomId(res.data.rooms[0]._id);
          setMonthlyRent(res.data.rooms[0].rentAmount);
          setDepositPaid(res.data.rooms[0].depositAmount || res.data.rooms[0].rentAmount * 2);
        } else {
          setSelectedRoomId('');
          setMonthlyRent('');
          setDepositPaid('');
        }
      }
    } catch (err) {
      console.error('Failed to load vacant rooms:', err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter, propertyFilter]);

  useEffect(() => {
    api.get('/properties').then((res) => {
      if (res.data.success) setProperties(res.data.properties);
    }).catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssignments();
  };

  const handlePropChange = (propId) => {
    setSelectedPropId(propId);
    loadVacantRoomsForProp(propId);
  };

  const handleRoomChange = (roomId) => {
    setSelectedRoomId(roomId);
    const rm = vacantRooms.find((r) => r._id === roomId);
    if (rm) {
      setMonthlyRent(rm.rentAmount);
      setDepositPaid(rm.depositAmount || rm.rentAmount * 2);
    }
  };

  const openAssignModal = async () => {
    await loadPropertiesAndAvailable();
    const today = new Date();
    const nextPeriod = new Date(today);
    nextPeriod.setMonth(today.getMonth() + 11);

    setLeaseStart(today.toISOString().split('T')[0]);
    setLeaseEnd(nextPeriod.toISOString().split('T')[0]);
    setRentDueDate(5);
    setNotes('Standard 11-month Leave & License agreement.');
    setIsAssignModalOpen(true);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      toast.error('Please select a vacant flat or room for assignment.');
      return;
    }
    if (!selectedTenantId) {
      toast.error('Please select a tenant to assign.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        propertyId: selectedPropId,
        roomId: selectedRoomId,
        tenantId: selectedTenantId,
        leaseStart,
        leaseEnd,
        rentDueDate: Number(rentDueDate),
        monthlyRent: Number(monthlyRent),
        depositPaid: Number(depositPaid || 0),
        notes,
      };

      const res = await api.post('/assignments', payload);
      if (res.data.success) {
        toast.success(res.data.message || 'Tenant assigned successfully.');
        setIsAssignModalOpen(false);
        fetchAssignments();
      }
    } catch (err) {
      // Handled by api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminateLease = async () => {
    if (!terminateId) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/assignments/${terminateId}/terminate`);
      if (res.data.success) {
        toast.success(res.data.message || 'Agreement closed.');
        setTerminateId(null);
        fetchAssignments();
      }
    } catch (err) {
      // Handled by api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tenants & Agreements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assign tenants to vacant flats, track Leave & License dates, and close completed tenancies.
          </p>
        </div>

        <button
          type="button"
          onClick={openAssignModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
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
            placeholder="Search tenant name, flat no., or property..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="terminated">Ended</option>
              <option value="all">All Records</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Property:</span>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader rows={5} />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenant agreements found"
          description="No active or closed agreements match your current filter. Assign a registered tenant to any vacant flat."
          actionLabel="Assign Tenant"
          onAction={openAssignModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tenant</th>
                  <th className="px-5 py-3 font-semibold">Property & Flat</th>
                  <th className="px-5 py-3 font-semibold text-right">Monthly Rent</th>
                  <th className="px-5 py-3 font-semibold text-right">Security Deposit</th>
                  <th className="px-5 py-3 font-semibold">Agreement Period</th>
                  <th className="px-5 py-3 font-semibold">Due Day</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {assignment.tenant?.name || 'Tenant'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {assignment.tenant?.email} · {assignment.tenant?.phone || 'No phone'}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {assignment.property?.name || 'Property'}
                      </div>
                      <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                        Flat {assignment.room?.roomNumber || 'N/A'} · Floor {assignment.room?.floor || 1}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatINR(assignment.monthlyRent)}
                    </td>

                    <td className="px-5 py-3.5 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatINR(assignment.depositPaid)}
                    </td>

                    <td className="px-5 py-3.5 tabular-nums text-slate-700 dark:text-slate-300">
                      <div>{formatDateIN(assignment.leaseStart)}</div>
                      <div className="text-[11px] text-slate-400">
                        to {formatDateIN(assignment.leaseEnd)}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 tabular-nums text-slate-600 dark:text-slate-300">
                      {assignment.rentDueDate}th of month
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge status={assignment.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {assignment.status === 'active' ? (
                        <button
                          type="button"
                          onClick={() => setTerminateId(assignment._id)}
                          className="text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          End Lease
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Tenant to Flat"
        subtitle="Only vacant flats and tenants without an active agreement appear below."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Property *
              </label>
              <select
                value={selectedPropId}
                onChange={(e) => handlePropChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
              >
                {properties.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vacant Flat / Room *
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                disabled={vacantRooms.length === 0}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer disabled:opacity-50"
              >
                {vacantRooms.length === 0 ? (
                  <option value="">No vacant flats in this property</option>
                ) : (
                  vacantRooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Flat {r.roomNumber} · Floor {r.floor} ({formatINR(r.rentAmount)}/mo)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registered Tenant * (Available only)
            </label>
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              disabled={availableTenants.length === 0}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer disabled:opacity-50"
            >
              {availableTenants.length === 0 ? (
                <option value="">All registered tenants already have active agreements</option>
              ) : (
                availableTenants.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.email})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={leaseStart}
                onChange={(e) => setLeaseStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={leaseEnd}
                onChange={(e) => setLeaseEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Rent (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                min={0}
                value={depositPaid}
                onChange={(e) => setDepositPaid(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Day
              </label>
              <input
                type="number"
                min={1}
                max={28}
                value={rentDueDate}
                onChange={(e) => setRentDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Agreement Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Parking slot, maintenance inclusion, notice period..."
              className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || vacantRooms.length === 0 || availableTenants.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!terminateId}
        onClose={() => setTerminateId(null)}
        onConfirm={handleTerminateLease}
        title="End Tenant Agreement?"
        message="This closes the active agreement and automatically marks the flat as Vacant so it can be assigned again."
        confirmText="End Lease"
        isDestructive={true}
        loading={submitting}
      />
    </div>
  );
}
