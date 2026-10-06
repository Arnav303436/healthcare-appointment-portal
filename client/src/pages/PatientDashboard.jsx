import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  XCircle,
  Ban,
  PlusCircle,
  Stethoscope,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const formatISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [cancelModalId, setCancelModalId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/appointments/mine');
      setAppointments(data);
    } catch (err) {
      showToast(err.message || 'Failed to retrieve appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async () => {
    if (!cancelModalId) return;
    try {
      setCancelling(true);
      await api.patch(`/api/appointments/${cancelModalId}/cancel`);
      showToast('Appointment successfully cancelled.', 'success');
      setCancelModalId(null);
      await fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to cancel appointment.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Helper to determine if an appointment is in the past
  const now = new Date();
  const todayStr = formatISODate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isAppointmentInPast = (dateStr, timeStr) => {
    if (dateStr < todayStr) return true;
    if (dateStr === todayStr) {
      const [h, m] = timeStr.split(':').map(Number);
      return (h * 60 + (m || 0)) <= currentMinutes;
    }
    return false;
  };

  // Metrics
  const totalCount = appointments.length;
  const upcomingCount = appointments.filter(
    (a) => !isAppointmentInPast(a.appointmentDate, a.timeSlot) && ['PENDING', 'CONFIRMED'].includes(a.status)
  ).length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((a) => ['CANCELLED', 'REJECTED'].includes(a.status)).length;

  // Filtered list
  const filteredAppointments = appointments.filter((a) => {
    const isPast = isAppointmentInPast(a.appointmentDate, a.timeSlot);
    if (activeTab === 'UPCOMING') {
      return !isPast && ['PENDING', 'CONFIRMED'].includes(a.status);
    }
    if (activeTab === 'COMPLETED') {
      return a.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return ['CANCELLED', 'REJECTED'].includes(a.status);
    }
    return true; // 'ALL'
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Pending Doctor Approval
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            Consultation Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Cancelled
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Ban className="w-3.5 h-3.5 text-slate-500" />
            Declined by Doctor
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
            Patient Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review your upcoming healthcare visits, past consultations, and doctor medical prescriptions.
          </p>
        </div>

        <Link
          to="/doctors"
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Book New Appointment
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
          <div className="text-2xl font-extrabold text-slate-900">{totalCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-emerald-600">Upcoming Visits</span>
          <div className="text-2xl font-extrabold text-emerald-700">{upcomingCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-sky-600">Completed Consultations</span>
          <div className="text-2xl font-extrabold text-sky-700">{completedCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Cancelled / Declined</span>
          <div className="text-2xl font-extrabold text-slate-600">{cancelledCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold space-x-6">
        {[
          { key: 'ALL', label: `All (${totalCount})` },
          { key: 'UPCOMING', label: `Upcoming (${upcomingCount})` },
          { key: 'COMPLETED', label: `Completed (${completedCount})` },
          { key: 'CANCELLED', label: `Cancelled (${cancelledCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No appointments in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any appointments matching the selected filter. Find a physician and reserve your next visit.
          </p>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm transition-all"
          >
            Browse Doctors
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const doc = appt.doctor || {};
            const profile = doc.doctorProfile || {};
            const isPast = isAppointmentInPast(appt.appointmentDate, appt.timeSlot);
            const canCancel = !isPast && ['PENDING', 'CONFIRMED'].includes(appt.status);

            return (
              <div
                key={appt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-sky-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold text-base flex items-center justify-center shrink-0">
                      {doc.name?.replace('Dr. ', '').charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                      <p className="text-xs text-teal-700 font-semibold">{profile.specialization}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(appt.status)}
                    {canCancel && (
                      <button
                        onClick={() => setCancelModalId(appt.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Date: <strong>{appt.appointmentDate}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Slot Time: <strong>{appt.timeSlot}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{profile.clinicAddress || 'Clinic Complex'}</span>
                  </div>
                </div>

                {/* Reason description */}
                <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Reported Symptoms / Reason:</span>
                  <p>{appt.reason}</p>
                </div>

                {/* Clinical Notes if completed */}
                {appt.status === 'COMPLETED' && (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Doctor's Consultation Notes & Prescription:
                    </div>
                    <p className="text-emerald-950 font-medium whitespace-pre-wrap leading-relaxed pt-1">
                      {appt.consultationNotes || 'Consultation completed successfully. Follow-up as needed.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Cancel Appointment?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel this scheduled consultation? This slot will become available for other patients.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalId(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelAppointment}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
