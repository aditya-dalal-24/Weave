import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import NotificationPanel from './NotificationPanel';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Sparkles, FileText, MessageSquare, Settings, LogOut, Menu, X,
  Briefcase, Users, ShieldCheck, ChevronDown, Sun, Moon, Maximize2, Minimize2
} from 'lucide-react';

const WeaveLogo = ({ size = 24 }) => (
  <img 
    src="/logo.png" 
    alt="Weave Logo" 
    className="object-contain p-1 rounded bg-white shadow-sm"
    style={{ width: size, height: size }} 
    onError={(e) => {
      // Fallback SVG if image is missing
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'block';
    }}
  />
);

const FallbackLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="hidden" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const candidateLinks = [
  { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/candidate/profile', label: 'Profile', icon: User },
  { to: '/candidate/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/candidate/applications', label: 'Applications', icon: FileText },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const recruiterLinks = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/recruiter/internships', label: 'Internships', icon: Briefcase },
  { to: '/recruiter/applicants', label: 'Applicants', icon: Users },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/verifications', label: 'Verifications', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop
  const [profileOpen, setProfileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const links = user?.role === 'CANDIDATE' ? candidateLinks : user?.role === 'RECRUITER' ? recruiterLinks : adminLinks;

  const displayName = user?.role === 'CANDIDATE'
    ? `${user.candidate?.firstName || ''} ${user.candidate?.lastName || ''}`
    : user?.role === 'RECRUITER'
      ? user.recruiter?.companyName || user.email
      : `${user?.admin?.firstName || ''} ${user?.admin?.lastName || ''}`;

  const avatarUrl = user?.role === 'CANDIDATE'
    ? user.candidate?.avatar
    : user?.role === 'RECRUITER'
      ? user.recruiter?.companyLogo
      : user?.admin?.avatar;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className={`h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-700/40 transition-all ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <WeaveLogo size={24} />
        <FallbackLogo size={24} />
        {!isCollapsed && <span className="font-extrabold text-[18px] text-navy dark:text-white tracking-tight">Weave</span>}
        <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              title={isCollapsed ? label : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5'} rounded-xl text-[13px] font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 dark:border-slate-700/40">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden lg:flex items-center justify-center w-full p-2 mb-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
        <button onClick={handleLogout} className={`flex items-center ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'} rounded-xl text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/15 hover:text-red-600 dark:hover:text-red-400 transition-colors`} title={isCollapsed ? "Logout" : undefined}>
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex transition-colors duration-200 overflow-x-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-slate-700/40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-[260px]'}`}>
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-slate-700/40 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-[260px]'}`}>
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-[#111827] border-b border-slate-200/80 dark:border-slate-700/40 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-30 transition-colors duration-200 shadow-sm">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          <div className="flex-1" />

          {/* Dark mode toggle */}
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? <Sun className="w-[18px] h-[18px] text-amber-400" /> : <Moon className="w-[18px] h-[18px] text-slate-500" />}
          </button>

          <NotificationPanel />

          {/* Profile dropdown */}
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 p-1 rounded-full sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white dark:ring-slate-900 ring-offset-2 ring-offset-transparent outline-none">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = displayName?.charAt(0)?.toUpperCase() || 'U';
                    }} 
                  />
                ) : (
                  displayName?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 hidden sm:block max-w-[120px] truncate">{displayName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 bg-white dark:bg-[#111827] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/50">
                      <p className="text-[13px] font-semibold text-navy dark:text-white truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300">{user?.role}</span>
                    </div>
                    <button onClick={() => { setProfileOpen(false); navigate('/settings'); }} className="flex items-center gap-2 w-full px-4 py-2 text-[13px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="flex items-center gap-2 w-full px-4 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content with Slide-up Animation */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
