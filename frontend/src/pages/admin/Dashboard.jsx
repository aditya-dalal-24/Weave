import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Briefcase, FileText, ShieldCheck, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then((r) => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-slate-500 dark:text-slate-400 py-20">Failed to load dashboard</p>;

  const stats = [
    { label: 'Total Users', value: data.stats.totalUsers, icon: Users, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Candidates', value: data.stats.totalCandidates, icon: Users, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Recruiters', value: data.stats.totalRecruiters, icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Internships', value: data.stats.totalInternships, icon: FileText, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Applications', value: data.stats.totalApplications, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Pending Verifications', value: data.stats.pendingVerifications, icon: ShieldCheck, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 card-hover">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-navy dark:text-white">{value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {data.applicationsByStatus?.length > 0 && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Applications by Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.applicationsByStatus.map((s) => (
              <div key={s.status} className="text-center p-3 rounded-lg bg-slate-50 dark:bg-[#0B1120]">
                <p className="text-xl font-bold text-navy dark:text-white">{s._count.status}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Users</h3>
        <div className="space-y-2">
          {data.recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {u.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.candidate ? `${u.candidate.firstName} ${u.candidate.lastName}` : u.recruiter ? u.recruiter.companyName : u.email}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${u.role === 'CANDIDATE' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : u.role === 'RECRUITER' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'}`}>{u.role}</span>
                <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
