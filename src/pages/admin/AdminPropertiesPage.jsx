import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { Building2, Search } from 'lucide-react';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties', { params: { search } });
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
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            All Properties
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Directory of all registered residential buildings, owners, and flat occupancy across cities.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
          {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search property, locality, or city..."
          className="w-full pl-9 pr-3.5 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </form>

      {/* Table */}
      {loading ? (
        <SkeletonLoader rows={5} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description="No properties match your search."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Landlord</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold text-center">Flats</th>
                  <th className="px-5 py-3 font-semibold text-center">Occupied / Vacant</th>
                  <th className="px-5 py-3 font-semibold text-right">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {properties.map((p) => {
                  const stats = p.stats || { totalRooms: 0, occupiedRooms: 0, vacantRooms: 0, occupancyRate: 0 };
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {p.landlord?.name || 'Landlord'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.landlord?.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        <div>{p.address}</div>
                        <div className="text-[11px] text-slate-400">
                          {p.city}, {p.state} {p.zipCode}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 capitalize text-slate-600 dark:text-slate-300">
                        {p.propertyType}
                      </td>
                      <td className="px-5 py-3.5 text-center font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                        {stats.totalRooms}
                      </td>
                      <td className="px-5 py-3.5 text-center tabular-nums text-slate-600 dark:text-slate-300">
                        <span className="text-teal-700 dark:text-teal-400 font-semibold">{stats.occupiedRooms}</span>
                        {' / '}
                        <span className="text-slate-500 font-semibold">{stats.vacantRooms}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {stats.occupancyRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
