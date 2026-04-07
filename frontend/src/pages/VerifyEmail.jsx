import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, RefreshCw, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AnimatedGradientBackground from '../components/ui/AnimatedGradientBackground';

export default function VerifyEmail() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email') || location.state?.email;
    if (!emailParam) {
      toast.error('No email found for verification');
      navigate('/login');
      return;
    }
    setEmail(emailParam);
  }, [location, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const user = await verifyOtp({ email, otp });
      toast.success('Email verified successfully!');
      const routes = { CANDIDATE: '/candidate/dashboard', RECRUITER: '/recruiter/dashboard', ADMIN: '/admin/dashboard' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await resendOtp(email);
      toast.success('New code sent to your email');
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

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

        <div className="w-full bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">Verify your email</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center px-4">
            We've sent a 6-digit verification code to <span className="text-slate-900 dark:text-white font-semibold">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1120]/50 text-slate-900 dark:text-white text-center text-3xl font-extrabold tracking-[0.5em] focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl text-base transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Verify Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={timer > 0 || resending}
                className={`font-bold transition-colors ${
                  timer > 0 || resending ? 'text-slate-400 cursor-not-allowed' : 'text-primary-600 dark:text-primary-400 hover:text-primary-700'
                }`}
              >
                {resending ? (
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-1" />
                ) : null}
                Resend {timer > 0 ? `in ${timer}s` : 'now'}
              </button>
            </p>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-medium transition-colors"
            >
              <Mail className="w-3 h-3" /> Use a different email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
