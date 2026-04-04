import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recruiterAPI } from '../../services/api';
import { Briefcase, Users, FileText, Star, Clock, Building2, Plus, ShieldCheck, AlertTriangle } from 'lucide-react';

const statusColors = {
  APPLIED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  SHORTLISTED: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  SELECTED: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
};

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruiterAPI.getDashboard().then((r) => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-slate-500 dark:text-slate-400 py-20">Failed to load dashboard</p>;

  const stats = [
    { label: 'Total Internships', value: data.stats.totalInternships, icon: Briefcase, color: 'text-primary-600 dark:text-primary-400', tileBg: 'bg-primary-50/40 dark:bg-primary-900/10 border-primary-100/50 dark:border-primary-800/30 text-primary-700 dark:text-primary-300' },
    { label: 'Active Postings', value: data.stats.activeInternships, icon: Star, color: 'text-teal-600 dark:text-teal-400', tileBg: 'bg-teal-50/40 dark:bg-teal-900/10 border-teal-100/50 dark:border-teal-800/30 text-teal-700 dark:text-teal-300' },
    { label: 'Total Applications', value: data.stats.totalApplications, icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', tileBg: 'bg-indigo-50/40 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-300' },
    { label: 'Shortlisted', value: data.stats.shortlisted, icon: Users, color: 'text-slate-600 dark:text-slate-400', tileBg: 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" /> {data.profile.companyName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Recruiter Dashboard</p>
        </div>
        <Link to="/recruiter/internships/new" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Post Internship
        </Link>
      </div>

      {!data.profile.isVerified && (
        <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Verification Pending</p>
            <p className="text-xs text-amber-600 dark:text-amber-400/70">Your account is under review. You can continue posting internships.</p>
          </div>
        </div>
      )}

      {data.profile.isVerified && (
        <div className="bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800/40 rounded-xl p-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-300">Verified Company</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, tileBg }) => (
          <div key={label} className={`rounded-xl border p-5 card-hover transition-colors ${tileBg}`}>
            <Icon className={`w-6 h-6 ${color} opacity-80 mb-3`} />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs font-medium opacity-70 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Applications</h3>
          <Link to="/recruiter/applicants" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">View All</Link>
        </div>
        {data.recentApplications.length === 0 ? (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">No applications received yet</p>
        ) : (
          <div className="space-y-3">
            {data.recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{app.candidate.firstName} {app.candidate.lastName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Applied for: {app.internship.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusColors[app.status]}`}>{app.status}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
