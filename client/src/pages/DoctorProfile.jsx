import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Award,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronLeft,
  X,
  CreditCard,
  User,
  Heart,
} from 'lucide-react';

const formatISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isDoctor } = useAuth();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  // Date selection (default to today or tomorrow)
  const todayStr = formatISODate(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Slots state
  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking modal/drawer state
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load Doctor Details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoadingDoctor(true);
        const data = await api.get(`/api/doctors/${id}`);
        setDoctor(data);
      } catch (err) {
        showToast(err.message || 'Doctor not found.', 'error');
        navigate('/doctors');
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [id, navigate, showToast]);

  // Load Slots whenever doctor ID or selected date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!id || !selectedDate) return;
      try {
        setLoadingSlots(true);
        const data = await api.get(`/api/doctors/${id}/slots?date=${selectedDate}`);
        setSlotsData(data);
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  const handleSelectSlot = (slot) => {
    if (!slot.isAvailable) return;

    if (!isAuthenticated) {
      showToast('Please log in to book an appointment.', 'info');
      navigate('/login', { state: { from: { pathname: `/doctors/${id}` } } });
      return;
    }

    if (isDoctor && user?.id === doctor?.id) {
      showToast('You cannot book an appointment with yourself.', 'error');
      return;
    }

    setSelectedSlot(slot.time);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please enter a brief reason for your consultation.', 'error');
      return;
    }

    try {
      setBookingInProgress(true);
      await api.post('/api/appointments', {
        doctorId: doctor.id,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        reason: reason.trim(),
      });

      showToast('Appointment booked successfully! Check your dashboard.', 'success');
      setIsModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to book appointment slot.', 'error');
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium">Loading doctor credentials...</p>
      </div>
    );
  }

  if (!doctor) return null;

  const profile = doctor.doctorProfile || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Doctors list
        </Link>
      </div>

      {/* Doctor Header Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-sky-600/20 shrink-0">
              {doctor.name.replace('Dr. ', '').charAt(0)}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{doctor.name}</h1>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {profile.specialization}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-amber-600">
                  <Award className="w-4 h-4 text-amber-500" />
                  {profile.experienceYears} Years Clinical Experience
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Board Certified Specialist
                </span>
                <span>•</span>
                <span>{doctor.email}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 pt-2 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{profile.clinicAddress}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Working Hours: {profile.workingHoursStart} - {profile.workingHoursEnd}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Badge Card */}
          <div className="sm:self-start bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left md:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Standard Consultation
            </span>
            <span className="text-3xl font-extrabold text-slate-900 block my-1">
              ${profile.consultationFee?.toFixed(2)}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              30-minute slot duration
            </span>
          </div>
        </div>
      </div>

      {/* Date Picker and Slot Selection Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Date & Available Time Slot</h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time slot availability is updated automatically. Bookings in the past or double-booked slots are strictly disabled.
            </p>
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Appointment Date:
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Selected Date Information Banner */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60">
          <span>
            Consultation schedule for: <strong className="text-slate-900">{selectedDate}</strong> ({slotsData?.dayName || 'Selected Day'})
          </span>
          <span className="text-slate-500">
            Working Days: {profile.workingDays}
          </span>
        </div>

        {/* Slots Grid */}
        {loadingSlots ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 py-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : !slotsData?.isWorkingDay ? (
          <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-amber-900">Doctor Off Duty on this Day</h4>
            <p className="text-xs text-amber-700 max-w-md mx-auto">
              {slotsData?.message || `Dr. ${doctor.name} does not hold clinical consultations on ${slotsData?.dayName}s. Please pick another weekday.`}
            </p>
          </div>
        ) : slotsData?.slots?.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-500">No slots configured for this date.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {slotsData.slots.map((slot) => {
                const isAvailable = slot.isAvailable;
                return (
                  <button
                    key={slot.time}
                    disabled={!isAvailable}
                    onClick={() => handleSelectSlot(slot)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isAvailable
                        ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 hover:bg-emerald-100 hover:border-emerald-500 hover:scale-[1.02] shadow-sm cursor-pointer'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="text-sm font-bold tracking-tight">{slot.time}</span>
                    <span className="text-[10px] font-semibold">
                      {isAvailable ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Available
                        </span>
                      ) : (
                        <span className="text-slate-400 line-through">
                          {slot.reason || 'Booked'}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400"></div>
                <span>Available Slot (Click to Book)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></div>
                <span>Unavailable / Booked / Passed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-base">
                <Calendar className="w-5 h-5 text-sky-600" />
                Confirm Appointment Details
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-bold text-slate-900">{doctor.name} ({profile.specialization})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold text-slate-900">{selectedDate} ({slotsData?.dayName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Slot Time:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedSlot}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-extrabold text-sm text-slate-900">
                  ${profile.consultationFee?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Consultation / Medical Symptoms *
                </label>
                <textarea
                  required
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Experiencing mild headaches for 3 days, routine blood pressure checkup..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-1">
                  This description will be shared with Dr. {doctor.name} prior to your visit.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingInProgress}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {bookingInProgress ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Confirm Appointment</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
