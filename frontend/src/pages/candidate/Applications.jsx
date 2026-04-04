import { useState, useEffect } from 'react';
import { applicationAPI } from '../../services/api';
import { FileText, Building2, Clock, MapPin, Trash2, X, IndianRupee, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors = {
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40',
  SHORTLISTED: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40',
  REJECTED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40',
  SELECTED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/40',
};

const statusLabels = { APPLIED: 'Applied', SHORTLISTED: 'Shortlisted', REJECTED: 'Rejected', SELECTED: 'Selected' };

const getSkillColor = (skillName) => {
  const colors = [
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/40',
    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800/40',
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40',
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800/40',
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/40',
  ];
  let hash = 0;
  for (let i = 0; i < Math.min(skillName.length, 10); i++) hash = skillName.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => { loadApplications(); }, [filter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const res = await applicationAPI.getMyApplications(params);
      setApps(res.data.data);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  const withdraw = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Withdraw this application?')) return;
    try { await applicationAPI.withdraw(id); toast.success('Application withdrawn'); loadApplications(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-white mb-1">My Applications</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Track all your internship applications</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filter === s ? 'bg-primary-50 dark:bg-primary-900/25 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No applications found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Browse recommendations and apply to internships</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} 
              onClick={() => setSelectedApp(app)}
              className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 card-hover cursor-pointer hover:border-primary-300 dark:hover:border-primary-700/50 transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-base font-bold text-navy dark:text-white">{app.internship.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" /> {app.internship.recruiter?.companyName || app.internship.company}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {app.internship.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.internship.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                    {app.matchScore > 0 && <span className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300 font-semibold">{app.matchScore}% match</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </span>
                  {app.status === 'APPLIED' && (
                    <button onClick={(e) => withdraw(app.id, e)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Withdraw">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-navy dark:text-white">{selectedApp.internship.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedApp.internship.recruiter?.companyName || selectedApp.internship.company}</p>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                  {selectedApp.internship.location && (
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                      <MapPin className="w-4 h-4 text-slate-400" /> {selectedApp.internship.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-400" /> {selectedApp.internship.duration}
                  </div>
                  {selectedApp.internship.stipend > 0 && (
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                      <IndianRupee className="w-4 h-4 text-slate-400" /> ₹{selectedApp.internship.stipend}/month
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                    <BriefcaseIcon className="w-4 h-4 text-slate-400" /> {selectedApp.internship.type}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-navy dark:text-white mb-2">Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {selectedApp.internship.description}
                  </p>
                </div>

                {selectedApp.internship.skills?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-navy dark:text-white mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.internship.skills.map(s => (
                        <span key={s} className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md border ${getSkillColor(s)}`}>
                           {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Applied on {new Date(selectedApp.appliedAt).toLocaleDateString()}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusColors[selectedApp.status]}`}>
                    {statusLabels[selectedApp.status]}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const BriefcaseIcon = ({ className }) => <Building2 className={className} />;
