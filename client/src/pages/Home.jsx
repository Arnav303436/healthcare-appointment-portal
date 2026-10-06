import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/apiClient';
import {
  Heart,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  MapPin,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

const SPECIALIZATIONS = [
  { name: 'Cardiology', icon: '❤️', desc: 'Heart care, ECG & BP management' },
  { name: 'Dermatology', icon: '✨', desc: 'Skin health, acne & laser therapies' },
  { name: 'Pediatrics', icon: '👶', desc: 'Child health, immunization & growth' },
  { name: 'Orthopedics', icon: '🦴', desc: 'Bone, joint & sports rehabilitation' },
  { name: 'Neurology', icon: '🧠', desc: 'Brain, nerves & headache treatment' },
  { name: 'General Medicine', icon: '🩺', desc: 'Primary family health & wellness' },
];

export const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await api.get('/api/doctors');
        setFeaturedDoctors(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-teal-50/30 to-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Trusted Healthcare Appointment Portal
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Fast, seamless booking with{' '}
                <span className="bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">
                  top specialist doctors
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Connect directly with certified physicians. Explore available real-time time slots, book appointments in seconds, and track your clinical consultation notes seamlessly.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/doctors"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-lg shadow-sky-600/25 hover:shadow-sky-600/35 transition-all text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Book Appointment Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/doctors"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-sm transition-all text-sm"
                >
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Browse All Specialists
                </Link>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div>
                  <div className="text-2xl font-bold text-slate-900">6+</div>
                  <div className="text-xs text-slate-500 font-medium">Top Specialties</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-600">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Real-Time Slots</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-sky-600">0 min</div>
                  <div className="text-xs text-slate-500 font-medium">No Wait Times</div>
                </div>
              </div>
            </div>

            {/* Hero Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl shadow-slate-200/60 border border-slate-100">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Dr. Sarah Jenkins</h4>
                      <p className="text-xs text-emerald-600 font-medium">Cardiology • 12 yrs exp</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                    Available Today
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                    <span>Available Slot Times</span>
                    <span className="text-sky-600 font-semibold">Today / Tomorrow</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="px-3 py-2 text-xs font-semibold bg-sky-50 text-sky-700 rounded-lg text-center border border-sky-200">
                      09:00 AM
                    </span>
                    <span className="px-3 py-2 text-xs font-semibold bg-sky-50 text-sky-700 rounded-lg text-center border border-sky-200">
                      10:30 AM
                    </span>
                    <span className="px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-400 rounded-lg text-center line-through">
                      02:00 PM
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block">Consultation Fee</span>
                    <span className="text-slate-900 font-bold text-base">$85.00</span>
                  </div>
                  <Link
                    to="/doctors/1"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
                  >
                    Select Slot
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
            Clinical Departments
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">Explore Medical Specializations</h2>
          <p className="text-sm text-slate-500">
            Select a specialization to discover certified doctors and available consultation schedules.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SPECIALIZATIONS.map((spec) => (
            <button
              key={spec.name}
              onClick={() => navigate(`/doctors?specialization=${encodeURIComponent(spec.name)}`)}
              className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">
                {spec.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                {spec.name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {spec.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
              Experienced Faculty
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Featured Doctors</h2>
            <p className="text-sm text-slate-500">Book directly with our top rated clinical specialists</p>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            View all 6 doctors
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-sky-200 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                      {doc.doctorProfile?.specialization}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {doc.doctorProfile?.experienceYears} years experience
                  </p>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {doc.doctorProfile?.bio}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.doctorProfile?.clinicAddress}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Consultation</span>
                    <span className="text-lg font-bold text-slate-900">
                      ${doc.doctorProfile?.consultationFee?.toFixed(2)}
                    </span>
                  </div>
                  <Link
                    to={`/doctors/${doc.id}`}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white transition-colors"
                  >
                    View & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Streamlined Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How CareSync Works</h2>
          <p className="text-xs sm:text-sm text-slate-400">Simple three-step appointment booking and consultation process</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-base border border-sky-500/30">
              1
            </div>
            <h3 className="font-bold text-base text-white">Choose Doctor & Date</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse certified physicians by medical department, inspect consultation fees, experience, and weekly hours.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base border border-teal-500/30">
              2
            </div>
            <h3 className="font-bold text-base text-white">Pick Real-Time Slot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select an available time slot. Double booking and past timestamps are strictly blocked by backend database logic.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base border border-purple-500/30">
              3
            </div>
            <h3 className="font-bold text-base text-white">Consult & Get Notes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Doctor confirms appointment, conducts the consultation, and adds clinical notes & prescription directly to your dashboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
