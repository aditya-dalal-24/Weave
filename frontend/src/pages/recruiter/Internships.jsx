import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { internshipAPI } from '../../services/api';
import { Plus, Edit, Trash2, Briefcase, Users, MapPin, Clock, IndianRupee, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadInternships(); }, []);

  const loadInternships = async () => {
    try { const res = await internshipAPI.getMyInternships(); setInternships(res.data.data); }
    catch { toast.error('Failed to load internships'); }
    finally { setLoading(false); }
  };

  const toggleActive = async (id, isActive) => {
    try { await internshipAPI.update(id, { isActive: !isActive }); toast.success(isActive ? 'Internship deactivated' : 'Internship activated'); loadInternships(); }
    catch { toast.error('Failed to update'); }
  };

  const deleteInternship = async (id) => {
    if (!confirm('Delete this internship? This cannot be undone.')) return;
    try { await internshipAPI.delete(id); toast.success('Internship deleted'); loadInternships(); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">Internships</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your internship postings</p>
        </div>
        <Link to="/recruiter/internships/new" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post New
        </Link>
      </div>

      {internships.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No internships posted</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create your first internship listing</p>
        </div>
      ) : (
        <div className="space-y-3">
          {internships.map((i) => (
            <div key={i.id} className={`bg-white dark:bg-[#111827] rounded-xl border ${i.isActive ? 'border-slate-200 dark:border-slate-700/50' : 'border-slate-200 dark:border-slate-700/50 opacity-60'} p-5 card-hover`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-navy dark:text-white">{i.title}</h3>
                    {!i.isActive && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap mt-1">
                    {i.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {i.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {i.duration}</span>
                    {i.stipend > 0 ? (
                      <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> ₹{i.stipend}/mo</span>
                    ) : (
                      <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Unpaid</span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">{i.type}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {i._count?.applications || 0} applicants</span>
                  </div>
                  {i.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {i.skills.map((s) => <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300">{s}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(i.id, i.isActive)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title={i.isActive ? 'Deactivate' : 'Activate'}>
                    {i.isActive ? <ToggleRight className="w-5 h-5 text-green-600 dark:text-green-400" /> : <ToggleLeft className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
                  </button>
                  <button onClick={() => navigate(`/recruiter/internships/${i.id}/edit`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" /></button>
                  <button onClick={() => deleteInternship(i.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
