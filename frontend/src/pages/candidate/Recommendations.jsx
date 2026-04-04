import { useState, useEffect } from 'react';
import { recommendationAPI, applicationAPI } from '../../services/api';
import { Sparkles, MapPin, Clock, IndianRupee, Building2, Zap, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    recommendationAPI.get().then((res) => setRecs(res.data.data))
      .catch(() => toast.error('Failed to load recommendations'))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (internshipId) => {
    setApplying(internshipId);
    try {
      await applicationAPI.apply({ internshipId });
      toast.success('Application submitted!');
      setRecs((prev) => prev.filter((r) => r.id !== internshipId));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
    finally { setApplying(null); }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40';
    return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  };

  const getScoreBarColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" /> AI Recommendations
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Internships matched to your skills, education, and preferences</p>
      </div>

      {recs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50">
          <Zap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No recommendations yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Complete your profile to get AI-powered internship matches</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec) => (
            <div key={rec.id} className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden card-hover">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-navy dark:text-white">{rec.title}</h3>
                      {rec.recruiter?.isVerified && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">Verified</span>}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {rec.company}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      {rec.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {rec.location}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.duration}</span>
                      {rec.stipend > 0 && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> ₹{rec.stipend}/mo</span>}
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">{rec.type}</span>
                    </div>
                  </div>

                  <div className={`flex flex-col items-center px-4 py-3 rounded-xl border ${getScoreColor(rec.matchScore)}`}>
                    <span className="text-2xl font-extrabold">{rec.matchScore}%</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">Match</span>
                  </div>
                </div>

                {rec.matchBreakdown && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Skills', value: rec.matchBreakdown.skills, max: 50 },
                      { label: 'Preferences', value: rec.matchBreakdown.preferences, max: 30 },
                      { label: 'Education', value: rec.matchBreakdown.education, max: 20 },
                    ].map(({ label, value, max }) => (
                      <div key={label}>
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                          <span>{label}</span>
                          <span className="font-semibold">{value}/{max}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${getScoreBarColor((value / max) * 100)}`} style={{ width: `${(value / max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {rec.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {rec.skills.map((s) => (
                      <span key={s} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getSkillColor(s)}`}>{s}</span>
                    ))}
                  </div>
                )}

                {expanded === rec.id && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-[#0B1120] rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{rec.description}</p>
                    {rec.requirements && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2"><strong className="text-navy dark:text-white">Requirements:</strong> {rec.requirements}</p>}
                    {rec.deadline && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Deadline: {new Date(rec.deadline).toLocaleDateString()}</p>}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <button onClick={() => handleApply(rec.id)} disabled={applying === rec.id}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-60">
                    <Send className="w-3.5 h-3.5" /> {applying === rec.id ? 'Applying...' : 'Apply Now'}
                  </button>
                  <button onClick={() => setExpanded(expanded === rec.id ? null : rec.id)} className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors">
                    {expanded === rec.id ? <><ChevronUp className="w-4 h-4" /> Less</> : <><ChevronDown className="w-4 h-4" /> Details</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
