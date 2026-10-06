import React from 'react';
import { Activity, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                <Activity className="w-4 h-4" />
              </div>
              CareSync Portal
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fullstack healthcare scheduling and patient-doctor appointment management system built for local college demonstration.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified Local SQLite Database
            </div>
          </div>

          {/* Specializations Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Departments</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/doctors?specialization=Cardiology" className="hover:text-sky-400 transition-colors">Cardiology</Link></li>
              <li><Link to="/doctors?specialization=Dermatology" className="hover:text-sky-400 transition-colors">Dermatology</Link></li>
              <li><Link to="/doctors?specialization=Pediatrics" className="hover:text-sky-400 transition-colors">Pediatrics</Link></li>
              <li><Link to="/doctors?specialization=Orthopedics" className="hover:text-sky-400 transition-colors">Orthopedics</Link></li>
              <li><Link to="/doctors?specialization=Neurology" className="hover:text-sky-400 transition-colors">Neurology</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Portals & Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/doctors" className="hover:text-sky-400 transition-colors">Browse Doctors</Link></li>
              <li><Link to="/dashboard" className="hover:text-sky-400 transition-colors">Patient Dashboard</Link></li>
              <li><Link to="/doctor/dashboard" className="hover:text-sky-400 transition-colors">Doctor Schedule & Notes</Link></li>
              <li><Link to="/login" className="hover:text-sky-400 transition-colors">Demo Logins</Link></li>
            </ul>
          </div>

          {/* Emergency / Help */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
              <PhoneCall className="w-4 h-4" />
              Medical Emergency
            </div>
            <p className="text-[11px] text-slate-300">
              For acute medical emergencies, please dial <strong>911 / 112</strong> immediately. This portal is intended for non-emergency scheduling.
            </p>
            <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-sky-400" />
              CareSync v1.0.0 (Localhost Demo)
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} CareSync Healthcare Portal. Built for College FSD Project.</p>
          <p className="text-slate-400 font-mono text-[11px]">Server: localhost:5000 | Client: localhost:5173</p>
        </div>
      </div>
    </footer>
  );
};
