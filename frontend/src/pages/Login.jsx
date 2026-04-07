import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedGradientBackground from '../components/ui/AnimatedGradientBackground';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success('Welcome back!');
      const routes = { CANDIDATE: '/candidate/dashboard', RECRUITER: '/recruiter/dashboard', ADMIN: '/admin/dashboard' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.message === 'Email not verified') {
        toast.error('Email not verified. Please check your inbox.');
        navigate('/verify-email', { state: { email: form.email } });
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const user = await googleLogin(tokenResponse.access_token);
        toast.success(`Welcome, ${user.firstName || user.companyName || 'User'}!`);
        const routes = { CANDIDATE: '/candidate/dashboard', RECRUITER: '/recruiter/dashboard', ADMIN: '/admin/dashboard' };
        navigate(routes[user.role] || '/');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google login failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error('Google login failed'),
  });

  const features = [
    'Smart skill-based matching algorithm',
    'Real-time chat with recruiters',
    'Track applications in one place',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel — animated gradient */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden">
        <AnimatedGradientBackground
          Breathing={true}
          animationSpeed={0.01}
          breathingRange={4}
          startingGap={130}
          topOffset={-10}
          gradientColors={[
            "#020617",
            "#0F172A",
            "#312e81",
            "#4F46E5",
            "#14B8A6",
            "#312e81",
            "#0F172A"
          ]}
          gradientStops={[20, 35, 50, 60, 72, 85, 100]}
        />

        <div className="relative z-10 max-w-lg px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 relative rounded-2xl shadow-xl border border-white/20 bg-white overflow-hidden flex-shrink-0">
                <img src="/logo.png" alt="Weave Logo" className="absolute inset-0 w-full h-full object-cover scale-[1.35]" 
                  onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="hidden" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span className="font-extrabold text-2xl text-white tracking-tight">Weave</span>
            </div>

            <h2 className="text-4xl font-extrabold text-white mb-4 leading-[1.15] tracking-tight">
              AI-Powered<br />Internship Matching
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
              Get personalized internship recommendations based on your skills, education, and career goals.
            </p>

            <div className="space-y-3.5">
              {features.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-300">{t}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative grid overlay */}
        <div className="absolute inset-0 z-[5] opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 relative rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Weave Logo" className="absolute inset-0 w-full h-full object-cover scale-[1.35]" 
                onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 hidden items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-extrabold text-xl text-navy dark:text-white tracking-tight">Weave</span>
          </div>

          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors mb-6 group"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-900/25 transition-colors">
              <svg className="w-4 h-4 -translate-x-0.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Back to home
          </Link>

          <h1 className="text-[28px] font-extrabold text-navy dark:text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px] mb-8">Sign in to your account with</p>

          <button
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group shadow-sm active:scale-[0.98] disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-primary-600 rounded-full animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500">
              <span className="bg-[#F8FAFC] dark:bg-[#0B1120] px-3">or email & password</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-navy dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-navy dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-sm transition-all pr-11 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Create one</Link>
          </p>

          <div className="mt-10 p-4 bg-slate-100/80 dark:bg-[#111827] rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-1.5 text-[13px] text-slate-600 dark:text-slate-400">
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Candidate</span> &mdash; alice@student.com / password123</p>
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Recruiter</span> &mdash; hr@techcorp.com / password123</p>
              <p><span className="font-semibold text-slate-700 dark:text-slate-300">Admin</span> &mdash; admin@internmatch.com / password123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
