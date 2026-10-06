import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Activity, Mail, Lock, LogIn, Sparkles, UserCheck, Stethoscope } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in both email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');

      const redirectPath = location.state?.from?.pathname || (user.role === 'DOCTOR' ? '/doctor/dashboard' : '/dashboard');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    try {
      setLoading(true);
      const user = await login(demoEmail, 'password123');
      showToast(`Logged in as ${user.name} (${user.role})!`, 'success');
      navigate(user.role === 'DOCTOR' ? '/doctor/dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      showToast(err.message || 'Failed demo login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sky-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-sky-600/30">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign in to CareSync</h1>
          <p className="text-xs text-slate-500">Access your appointments, health records, or doctor schedule</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 hover:shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Quick Logins Box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Logins (Evaluation Ready):
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill('dr.jenkins@healthportal.com', 'DOCTOR')}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 text-teal-800 text-left transition-all"
              >
                <div className="flex items-center gap-1 font-bold">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  Dr. Jenkins
                </div>
                <div className="text-[10px] text-teal-600">Cardiology</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('dr.miller@healthportal.com', 'DOCTOR')}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 text-teal-800 text-left transition-all"
              >
                <div className="flex items-center gap-1 font-bold">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  Dr. Miller
                </div>
                <div className="text-[10px] text-teal-600">General Med</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('john.doe@example.com', 'PATIENT')}
                className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 text-sky-800 text-left transition-all"
              >
                <div className="flex items-center gap-1 font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                  John Doe
                </div>
                <div className="text-[10px] text-sky-600">Patient account</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('alice.smith@example.com', 'PATIENT')}
                className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 text-sky-800 text-left transition-all"
              >
                <div className="flex items-center gap-1 font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                  Alice Smith
                </div>
                <div className="text-[10px] text-sky-600">Patient account</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
