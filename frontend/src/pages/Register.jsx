import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedGradientBackground from '../components/ui/AnimatedGradientBackground';


export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || 'CANDIDATE',
    firstName: '',
    lastName: '',
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      const routes = { CANDIDATE: '/candidate/dashboard', RECRUITER: '/recruiter/dashboard', ADMIN: '/admin/dashboard' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0B1120]/50 text-slate-900 dark:text-white focus:border-primary-500 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/20 focus:bg-white dark:focus:bg-[#0B1120] outline-none text-sm transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 text-slate-800 dark:text-white transition-colors duration-200 relative overflow-hidden">
      <AnimatedGradientBackground
        Breathing={true}
        animationSpeed={0.015}
        breathingRange={6}
        startingGap={100}
        gradientColors={["#0F172A", "#312e81", "#4F46E5", "#14B8A6", "#312e81", "#020617"]}
        gradientStops={[10, 30, 45, 60, 80, 100]}
        containerClassName="opacity-90 dark:opacity-100"
      />

      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="Weave Logo" className="w-10 h-10 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 object-contain p-1 bg-white"  
            onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 hidden items-center justify-center shadow-lg shadow-primary-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Weave</span>
        </div>

        <div className="w-full bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">Create an account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center">Join Weave and start your journey</p>

          {/* Role Tabs */}
          <div className="flex bg-slate-100 dark:bg-[#0B1120] rounded-xl p-1.5 mb-8">
            {['CANDIDATE', 'RECRUITER'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  form.role === role ? 'bg-white dark:bg-[#111827] text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {role === 'CANDIDATE' ? <><User className="w-4 h-4" /> Candidate</> : <><Building2 className="w-4 h-4" /> Recruiter</>}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {form.role === 'CANDIDATE' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                  <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={inputClass} placeholder="Alice" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                  <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={inputClass} placeholder="Johnson" />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className={inputClass} placeholder="TechCorp" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass} placeholder="you@example.com" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`${inputClass} pr-11`} placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`${inputClass} pr-11`} placeholder="Re-enter password" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30 active:scale-[0.98]">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
