import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';
import { Building2, Plus, Search, Edit2, Trash2, Check } from 'lucide-react';

const COMMON_AMENITIES = [
  '24x7 Power Backup',
  'Covered Parking',
  'Lift',
  'CCTV Security',
  'RO Water Supply',
  'Piped PNG Gas',
  'Intercom',
  'Solar Water Heater',
  'Gym',
  'High-speed Fiber WiFi',
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deletePropId, setDeletePropId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties', {
        params: { search, type: typeFilter },
      });
      if (res.data.success) {
        setProperties(res.data.properties);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const openCreateModal = () => {
    setEditingProperty(null);
    setName('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setPropertyType('apartment');
    setDescription('');
    setSelectedAmenities([]);
    setIsModalOpen(true);
  };

  const openEditModal = (prop) => {
    setEditingProperty(prop);
    setName(prop.name);
    setAddress(prop.address);
    setCity(prop.city);
    setState(prop.state);
    setZipCode(prop.zipCode);
    setPropertyType(prop.propertyType || 'apartment');
    setDescription(prop.description || '');
    setSelectedAmenities(prop.amenities || []);
    setIsModalOpen(true);
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSaveProperty = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name,
        address,
        city,
        state,
        zipCode,
        propertyType,
        description,
        amenities: selectedAmenities,
      };

      if (editingProperty) {
        const res = await api.put(`/properties/${editingProperty._id}`, payload);
        if (res.data.success) {
          toast.success('Property updated');
          setIsModalOpen(false);
          fetchProperties();
        }
      } else {
        const res = await api.post('/properties', payload);
        if (res.data.success) {
          toast.success('Property added');
          setIsModalOpen(false);
          fetchProperties();
        }
      }
    } catch (err) {
      // Handled by api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!deletePropId) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/properties/${deletePropId}`);
      if (res.data.success) {
        toast.success('Property removed');
        setDeletePropId(null);
        fetchProperties();
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
            Properties
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Buildings, residential societies, and independent floors you manage.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search building name, locality, or city..."
            className="w-full pl-9 pr-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </form>

        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500 whitespace-nowrap">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartments</option>
            <option value="condo">Residences / Condos</option>
            <option value="house">Builder Floors / Houses</option>
            <option value="townhouse">Row Houses</option>
            <option value="studio">Studios / PG</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonLoader type="cards" rows={3} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties added yet"
          description="Add your first building or residential wing to start managing flats and tenants."
          actionLabel="Add Property"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => {
            const stats = prop.stats || { totalRooms: 0, occupiedRooms: 0, vacantRooms: 0, occupancyRate: 0 };
            const defaultImg = '/assets/images/indian_residency_hero_1795086777363.jpg';
            const displayImg = (prop.images && prop.images[0]) || defaultImg;

            return (
              <div
                key={prop._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <img
                    src={displayImg}
                    alt={prop.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover bg-slate-100 dark:bg-slate-800"
                  />

                  <div className="p-5">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                      {prop.propertyType} · {prop.city}, {prop.state}
                    </div>

                    <Link
                      to={`/landlord/properties/${prop._id}`}
                      className="mt-1 block font-display text-base font-bold text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-400 transition-colors line-clamp-1"
                    >
                      {prop.name}
                    </Link>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                      {prop.address} — {prop.zipCode}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs tabular-nums">
                      <span className="text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-100">{stats.occupiedRooms}</strong>/{stats.totalRooms} occupied
                      </span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {stats.vacantRooms} vacant
                      </span>
                    </div>

                    {prop.amenities && prop.amenities.length > 0 && (
                      <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {prop.amenities.slice(0, 3).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/landlord/properties/${prop._id}`}
                    className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    Open Flats & Leases
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(prop)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-md cursor-pointer"
                      title="Edit property"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletePropId(prop._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-md cursor-pointer"
                      title="Delete property"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProperty ? 'Edit Property' : 'Add Property'}
        subtitle="Enter building name, locality, city, and pin code."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProperty} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Society / Building Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shanti Niketan Residency"
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Locality / Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot 18, Paud Road, Kothrud"
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pin Code *
                </label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="411038"
                  className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Property Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="apartment">Apartment Society</option>
                <option value="condo">Residential Wing / Condo</option>
                <option value="house">Independent Builder Floor / House</option>
                <option value="townhouse">Row House / Bungalow</option>
                <option value="studio">Studio / PG</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key highlights such as metro proximity, water supply, parking..."
                className="w-full px-3.5 py-2 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Building Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-2 rounded-md text-xs font-medium text-left flex items-center justify-between border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{amenity}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-teal-700 dark:text-teal-400" />}
                  </button>
                );
              })}
            </div>
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
              {submitting ? 'Saving...' : editingProperty ? 'Save Changes' : 'Create Property'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletePropId}
        onClose={() => setDeletePropId(null)}
        onConfirm={handleDeleteProperty}
        title="Delete property?"
        message="This removes the property and all its vacant flats. Properties with occupied flats cannot be deleted."
        confirmText="Delete"
        isDestructive={true}
        loading={submitting}
      />
    </div>
  );
}
