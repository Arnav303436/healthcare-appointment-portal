import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import {
  Search,
  Filter,
  Award,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  User,
} from 'lucide-react';

const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'General Medicine',
];

export const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialSpecialization = searchParams.get('specialization') || 'All';
  const [selectedSpecialization, setSelectedSpecialization] = useState(initialSpecialization);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        let query = `/api/doctors?`;
        if (searchTerm.trim()) {
          query += `search=${encodeURIComponent(searchTerm.trim())}&`;
        }
        if (selectedSpecialization && selectedSpecialization !== 'All') {
          query += `specialization=${encodeURIComponent(selectedSpecialization)}&`;
        }

        const data = await api.get(query);
        setDoctors(data);
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [searchTerm, selectedSpecialization]);

  const handleSpecializationChange = (spec) => {
    setSelectedSpecialization(spec);
    const newParams = new URLSearchParams(searchParams);
    if (spec === 'All') {
      newParams.delete('specialization');
    } else {
      newParams.set('specialization', spec);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find Specialist Doctors</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Search qualified medical specialists, compare consultation fees, inspect credentials, and select your preferred consultation slot.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor by name (e.g. Jenkins, Chen, Miller)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:w-64 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedSpecialization}
              onChange={(e) => handleSpecializationChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
            >
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Specializations' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specialization Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
            Quick Filter:
          </span>
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec}
              onClick={() => handleSpecializationChange(spec)}
              className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-all cursor-pointer ${
                selectedSpecialization === spec
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No doctors found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any doctors matching your search criteria. Try choosing a different specialization or clearing search filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              handleSpecializationChange('All');
            }}
            className="px-4 py-2 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            const profile = doctor.doctorProfile || {};
            return (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-sky-600/10">
                      {doctor.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                      {profile.specialization}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-amber-600">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {profile.experienceYears} Years Exp
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{doctor.phone || 'Available for visits'}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {profile.bio}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{profile.clinicAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {profile.workingHoursStart} - {profile.workingHoursEnd} ({profile.workingDays?.split(',').slice(0, 3).join(', ')}...)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                      Consultation Fee
                    </span>
                    <span className="text-xl font-extrabold text-slate-900">
                      ${profile.consultationFee?.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-all"
                  >
                    View Slots & Book
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
