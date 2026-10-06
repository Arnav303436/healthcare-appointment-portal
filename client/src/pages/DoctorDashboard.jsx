import React, { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Stethoscope,
  Phone,
  Mail,
  Sparkles,
  ChevronRight,
  X,
  MessageSquare,
} from 'lucide-react';

const formatISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');

  // Complete consultation modal
  const [selectedApptForNotes, setSelectedApptForNotes] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [submittingNotes, setSubmittingNotes] = useState(false);

  const todayStr = formatISODate(new Date());

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/appointments/mine');
      setAppointments(data);
    } catch (err) {
      showToast(err.message || 'Failed to load doctor appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (appointmentId, newStatus, notes = null) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/status`, {
        status: newStatus,
        ...(notes !== null && { consultationNotes: notes }),
      });

      showToast(`Appointment status updated to ${newStatus}.`, 'success');
      await fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleOpenCompleteModal = (appt) => {
    setSelectedApptForNotes(appt);
    setConsultationNotes(appt.consultationNotes || '');
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!consultationNotes.trim()) {
      showToast('Please enter consultation notes or prescription before marking complete.', 'error');
      return;
    }

    try {
      setSubmittingNotes(true);
      await api.patch(`/api/appointments/${selectedApptForNotes.id}/status`, {
        status: 'COMPLETED',
        consultationNotes: consultationNotes.trim(),
      });

      showToast('Consultation marked as COMPLETED and clinical notes saved.', 'success');
      setSelectedApptForNotes(null);
      await fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to complete consultation.', 'error');
    } finally {
      setSubmittingNotes(false);
    }
  };

  // Metrics
  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const todayCount = appointments.filter((a) => a.appointmentDate === todayStr && a.status === 'CONFIRMED').length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'PENDING') return a.status === 'PENDING';
    if (activeTab === 'CONFIRMED') return a.status === 'CONFIRMED';
    if (activeTab === 'TODAY') return a.appointmentDate === todayStr && a.status === 'CONFIRMED';
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    return true; // 'ALL'
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Doctor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
            Physician Management Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
            Schedule & Clinical Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {user?.name} • {user?.doctorProfile?.specialization} • Fee: ${user?.doctorProfile?.consultationFee?.toFixed(2)}
          </p>
        </div>

        <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 self-start sm:self-auto flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          Today's Date: <strong>{todayStr}</strong>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-amber-600">Pending Requests</span>
          <div className="text-2xl font-extrabold text-amber-700">{pendingCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-teal-600">Today's Visits</span>
          <div className="text-2xl font-extrabold text-teal-700">{todayCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-sky-600">Total Confirmed</span>
          <div className="text-2xl font-extrabold text-sky-700">{confirmedCount}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Completed Records</span>
          <div className="text-2xl font-extrabold text-slate-700">{completedCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold space-x-6 overflow-x-auto no-scrollbar">
        {[
          { key: 'PENDING', label: `Pending Requests (${pendingCount})` },
          { key: 'CONFIRMED', label: `Confirmed (${confirmedCount})` },
          { key: 'TODAY', label: `Today's Schedule (${todayCount})` },
          { key: 'COMPLETED', label: `Completed (${completedCount})` },
          { key: 'ALL', label: `All Records (${appointments.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 -mb-px shrink-0 ${
              activeTab === tab.key
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointment Requests List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No appointments in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no patient appointments matching this status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const pat = appt.patient || {};
            const isToday = appt.appointmentDate === todayStr;

            return (
              <div
                key={appt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-teal-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                      {pat.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{pat.name}</h3>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {pat.email}
                        </span>
                        {pat.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {pat.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator & Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {appt.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'REJECTED')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </>
                    )}

                    {appt.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleOpenCompleteModal(appt)}
                        className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Complete & Add Notes
                      </button>
                    )}

                    {appt.status === 'COMPLETED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}

                    {appt.status === 'CANCELLED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Cancelled by Patient
                      </span>
                    )}

                    {appt.status === 'REJECTED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Date & Time info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Date: <strong className="text-slate-900">{appt.appointmentDate}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Slot Time: <strong className="text-teal-700">{appt.timeSlot}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Status: <strong className="text-slate-900">{appt.status}</strong>
                    </span>
                  </div>
                </div>

                {/* Patient reported reason */}
                <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Patient Consultation Reason:</span>
                  <p>{appt.reason}</p>
                </div>

                {/* Clinical notes if available */}
                {appt.consultationNotes && (
                  <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-teal-900">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        Clinical Consultation Notes & Prescription:
                      </div>
                      <button
                        onClick={() => handleOpenCompleteModal(appt)}
                        className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
                      >
                        Edit Notes
                      </button>
                    </div>
                    <p className="text-teal-950 font-medium whitespace-pre-wrap leading-relaxed pt-1">
                      {appt.consultationNotes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Complete & Add Notes Modal */}
      {selectedApptForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-base">
                <FileText className="w-5 h-5 text-teal-600" />
                Clinical Notes & Consultation Summary
              </div>
              <button
                onClick={() => setSelectedApptForNotes(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div>
                Patient: <strong className="text-slate-900">{selectedApptForNotes.patient?.name}</strong>
              </div>
              <div>
                Slot: <strong className="text-slate-900">{selectedApptForNotes.appointmentDate} at {selectedApptForNotes.timeSlot}</strong>
              </div>
              <div className="text-slate-500 pt-1">
                Reason: {selectedApptForNotes.reason}
              </div>
            </div>

            <form onSubmit={handleSaveConsultation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Diagnosis, Clinical Notes & Prescription *
                </label>
                <textarea
                  required
                  rows="4"
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="e.g. Patient presented with elevated BP. Prescribed Lifestyle modifications, low sodium diet, and Metoprolol 25mg daily. Review in 3 weeks..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-1">
                  These clinical notes will be securely visible to the patient on their dashboard.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApptForNotes(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNotes}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingNotes ? 'Saving...' : 'Save & Complete Consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
