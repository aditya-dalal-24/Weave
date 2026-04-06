import { useState, useEffect } from 'react';
import { recruiterAPI, internshipAPI, chatAPI } from '../../services/api';
import { Users, GraduationCap, Wrench, Check, X, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  APPLIED: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  SHORTLISTED: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  SELECTED: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
};

const selectClass = "px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-navy dark:text-white outline-none focus:border-primary-400 dark:focus:border-primary-500 transition-all";

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ internshipId: '', status: '' });
  const navigate = useNavigate();

  useEffect(() => {
    internshipAPI.getMyInternships().then((r) => setInternships(r.data.data)).catch(() => {});
    loadApplicants();
  }, []);

  useEffect(() => { loadApplicants(); }, [filters]);

  const loadApplicants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.internshipId) params.internshipId = filters.internshipId;
      if (filters.status) params.status = filters.status;
      const res = await recruiterAPI.getApplicants(params);
      setApplicants(res.data.data);
    } catch { toast.error('Failed to load applicants'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (applicationId, status) => {
    try { await recruiterAPI.updateStatus(applicationId, status); toast.success(`Application ${status.toLowerCase()}`); loadApplicants(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const startChat = async (candidateUserId) => {
    try { await chatAPI.sendMessage({ receiverId: candidateUserId, content: 'Hello! I would like to discuss your application.' }); navigate('/chat'); }
    catch { navigate('/chat'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Applicants</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Review and manage candidate applications</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select value={filters.internshipId} onChange={(e) => setFilters({ ...filters, internshipId: e.target.value })} className={selectClass}>
          <option value="">All Internships</option>
          {internships.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={selectClass}>
          <option value="">All Statuses</option>
          <option value="APPLIED">Applied</option><option value="SHORTLISTED">Shortlisted</option>
          <option value="SELECTED">Selected</option><option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No applicants found</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {applicants.map((app) => (
            <div key={app.id} className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 card-hover">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {app.candidate.firstName?.charAt(0)}{app.candidate.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy dark:text-white">{app.candidate.firstName} {app.candidate.lastName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Applied for: {app.internship.title}</p>
                    </div>
                  </div>
                  {app.candidate.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 ml-11">
                      {app.candidate.skills.slice(0, 6).map((s) => (
                        <span key={s.id} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300 flex items-center gap-1">
                          <Wrench className="w-2.5 h-2.5" /> {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {app.candidate.education?.[0] && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-11 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> {app.candidate.education[0].degree} in {app.candidate.education[0].field}
                    </p>
                  )}
                  {typeof app.matchScore === 'number' && (
                    <span className="ml-11 mt-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300">{app.matchScore}% match</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColors[app.status]}`}>{app.status}</span>
                  {app.status === 'APPLIED' && (
                    <>
                      <button onClick={() => updateStatus(app.id, 'SHORTLISTED')} className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-colors" title="Shortlist"><Check className="w-4 h-4" /></button>
                      <button onClick={() => updateStatus(app.id, 'REJECTED')} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors" title="Reject"><X className="w-4 h-4" /></button>
                    </>
                  )}
                  {app.status === 'SHORTLISTED' && (
                    <button onClick={() => updateStatus(app.id, 'SELECTED')} className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium transition-colors">Select</button>
                  )}
                  {app.status === 'SELECTED' && (
                    <button onClick={() => startChat(app.candidate.userId)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" title="Start New Chat"><MessageSquare className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
