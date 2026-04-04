import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { candidateAPI } from '../../services/api';
import { Briefcase, FileText, Star, TrendingUp, Sparkles, ArrowRight, Clock } from 'lucide-react';

const statusColors = {
  APPLIED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  SHORTLISTED: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  SELECTED: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
};

export default function CandidateDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidateAPI.getDashboard().then((res) => {
      setData(res.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-slate-500 dark:text-slate-400 py-20">Failed to load dashboard</p>;

  const stats = [
    { label: 'Applications', value: data.stats.totalApplications, icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', tileBg: 'bg-indigo-50/40 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-300' },
    { label: 'Shortlisted', value: data.stats.shortlisted, icon: Star, color: 'text-teal-600 dark:text-teal-400', tileBg: 'bg-teal-50/40 dark:bg-teal-900/10 border-teal-100/50 dark:border-teal-800/30 text-teal-700 dark:text-teal-300' },
    { label: 'Selected', value: data.stats.selected, icon: TrendingUp, color: 'text-slate-600 dark:text-slate-400', tileBg: 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300' },
    { label: 'Active Internships', value: data.stats.activeInternships, icon: Briefcase, color: 'text-primary-600 dark:text-primary-400', tileBg: 'bg-primary-50/40 dark:bg-primary-900/10 border-primary-100/50 dark:border-primary-800/30 text-primary-700 dark:text-primary-300' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Welcome back, {data.profile.firstName}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's your internship journey overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, tileBg }) => (
          <div key={label} className={`rounded-xl border p-5 card-hover transition-colors ${tileBg}`}>
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-6 h-6 ${color} opacity-80`} />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs font-medium opacity-70 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Strength */}
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Profile Strength</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke={data.profile.profileStrength >= 70 ? '#14B8A6' : data.profile.profileStrength >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3" strokeDasharray={`${data.profile.profileStrength} 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-navy dark:text-white">{data.profile.profileStrength}%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{data.profile.profileStrength >= 70 ? 'Great profile!' : 'Needs improvement'}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Complete your profile for better matches</p>
            </div>
          </div>
          <Link to="/candidate/profile" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 transition-colors">
            Improve Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Applications</h3>
            <Link to="/candidate/applications" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">View All</Link>
          </div>
          {data.recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No applications yet</p>
              <Link to="/candidate/recommendations" className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1 inline-block">Browse Recommendations</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{app.internship.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{app.internship.company}</p>
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

      {/* Quick Action */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold mb-1">Get AI Recommendations</h3>
          <p className="text-primary-200 text-sm">See internships matched to your skills and preferences</p>
        </div>
        <Link to="/candidate/recommendations" className="px-5 py-2.5 bg-white text-primary-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
          <Sparkles className="w-4 h-4" /> View Matches
        </Link>
      </div>
    </div>
  );
}
