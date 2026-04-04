import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { internshipAPI } from '../../services/api';
import { ArrowLeft, Save, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-navy dark:text-white focus:border-primary-400 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function PostInternship() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'REMOTE', location: '', industry: '',
    stipend: '', duration: '', skills: '', requirements: '', deadline: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await internshipAPI.create({
        ...form,
        stipend: parseInt(form.stipend) || 0,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Internship posted!');
      navigate('/recruiter/internships');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" /></button>
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">Post Internship</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create a new internship listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. Full Stack Developer Intern" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
          <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} placeholder="Describe the role..." />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Type *</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
              <option value="REMOTE">Remote</option><option value="ONSITE">Onsite</option><option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="e.g. Bengaluru, Remote, Hybrid" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Industry</label>
            <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={inputClass} placeholder="e.g. Technology" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Duration *</label>
            <input required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} placeholder="e.g. 3 months" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5"><IndianRupee className="w-4 h-4"/> Stipend (₹/month)</label>
            <input type="number" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} className={inputClass} placeholder="e.g. 15000" min="0" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Required Skills (comma-separated)</label>
          <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className={inputClass} placeholder="e.g. React, Node.js, Python" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Requirements</label>
          <textarea rows={2} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className={`${inputClass} resize-none`} placeholder="Any specific eligibility requirements..." />
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-60 transition-colors">
          <Save className="w-4 h-4" /> {loading ? 'Posting...' : 'Post Internship'}
        </button>
      </form>
    </div>
  );
}
