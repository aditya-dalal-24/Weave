import { useState, useEffect } from 'react';
import { candidateAPI } from '../../services/api';
import { Plus, Trash2, GraduationCap, Wrench, MapPin, Save, Lightbulb, X } from 'lucide-react';
import toast from 'react-hot-toast';

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-navy dark:text-white focus:border-primary-400 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function CandidateProfile() {
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Intermediate' });
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' });
  const [showEduForm, setShowEduForm] = useState(false);
  const [personalForm, setPersonalForm] = useState({ firstName: '', lastName: '', phone: '', bio: '' });
  const [prefForm, setPrefForm] = useState({ locations: '', types: [], industries: '', minStipend: 0 });

  useEffect(() => {
    loadProfile();
    candidateAPI.getSuggestions().then((r) => setSuggestions(r.data.data)).catch(() => {});
  }, []);

  const loadProfile = async () => {
    try {
      const res = await candidateAPI.getProfile();
      const p = res.data.data;
      setProfile(p);
      setPersonalForm({ firstName: p.firstName || '', lastName: p.lastName || '', phone: p.phone || '', bio: p.bio || '' });
      if (p.preferences) {
        setPrefForm({
          locations: p.preferences.locations?.join(', ') || '',
          types: p.preferences.types || [],
          industries: p.preferences.industries?.join(', ') || '',
          minStipend: p.preferences.minStipend || 0,
        });
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const savePersonal = async () => {
    setSaving(true);
    try {
      await candidateAPI.updateProfile(personalForm);
      toast.success('Profile updated!');
      loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const addSkill = async () => {
    if (!newSkill.name.trim()) return;
    try {
      await candidateAPI.addSkill(newSkill);
      toast.success('Skill added!');
      setNewSkill({ name: '', proficiency: 'Intermediate' });
      setShowSkillForm(false);
      loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const deleteSkill = async (id) => {
    try { await candidateAPI.deleteSkill(id); toast.success('Skill removed'); loadProfile(); }
    catch { toast.error('Failed'); }
  };

  const addEducation = async () => {
    if (!newEdu.institution || !newEdu.degree || !newEdu.field || !newEdu.startDate) {
      toast.error('Please fill required fields'); return;
    }
    try {
      await candidateAPI.addEducation(newEdu);
      toast.success('Education added!');
      setNewEdu({ institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' });
      setShowEduForm(false);
      loadProfile();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteEducation = async (id) => {
    try { await candidateAPI.deleteEducation(id); toast.success('Education removed'); loadProfile(); }
    catch { toast.error('Failed'); }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await candidateAPI.updatePreferences({
        locations: prefForm.locations.split(',').map((s) => s.trim()).filter(Boolean),
        types: prefForm.types,
        industries: prefForm.industries.split(',').map((s) => s.trim()).filter(Boolean),
        minStipend: parseInt(prefForm.minStipend) || 0,
      });
      toast.success('Preferences saved!');
      loadProfile();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!profile) return <p className="text-center text-slate-500 dark:text-slate-400 py-20">Profile not found</p>;

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your profile for better internship matches</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300 text-xs font-semibold">
          Strength: {profile.profileStrength}%
        </div>
      </div>

      {/* Suggestions */}
      {suggestions?.suggestions?.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Profile Improvement Tips</span>
          </div>
          <ul className="space-y-1">
            {suggestions.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-amber-700 dark:text-amber-400/80">&#8226; {s.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-[#0B1120] rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${activeTab === tab.id ? 'bg-white dark:bg-[#111827] text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {activeTab === 'personal' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">First Name</label>
              <input value={personalForm.firstName} onChange={(e) => setPersonalForm({ ...personalForm, firstName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Last Name</label>
              <input value={personalForm.lastName} onChange={(e) => setPersonalForm({ ...personalForm, lastName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label>
              <input value={personalForm.phone} onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
              <input value={profile.user?.email || ''} disabled className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] text-slate-400 dark:text-slate-500" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Bio</label>
            <textarea rows={3} value={personalForm.bio} onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
              className={`${inputClass} resize-none`} placeholder="Tell recruiters about yourself..." />
          </div>
          <button onClick={savePersonal} disabled={saving} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Education */}
      {activeTab === 'education' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy dark:text-white">Education</h2>
            <button onClick={() => setShowEduForm(true)} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {showEduForm && (
            <div className="border border-primary-200 dark:border-primary-800/40 rounded-xl p-4 mb-4 bg-primary-50/30 dark:bg-primary-900/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">New Education</span>
                <button onClick={() => setShowEduForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input value={newEdu.institution} onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })} placeholder="Institution *" className={inputClass} />
                <input value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} placeholder="Degree *" className={inputClass} />
                <input value={newEdu.field} onChange={(e) => setNewEdu({ ...newEdu, field: e.target.value })} placeholder="Field of Study *" className={inputClass} />
                <input value={newEdu.grade} onChange={(e) => setNewEdu({ ...newEdu, grade: e.target.value })} placeholder="Grade (optional)" className={inputClass} />
                <input type="date" value={newEdu.startDate} onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })} className={inputClass} />
                <input type="date" value={newEdu.endDate} onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })} className={inputClass} />
              </div>
              <button onClick={addEducation} className="px-4 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700">Add Education</button>
            </div>
          )}

          {profile.education.length === 0 ? (
            <div className="text-center py-8"><GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" /><p className="text-sm text-slate-500 dark:text-slate-400">No education added</p></div>
          ) : (
            <div className="space-y-3">
              {profile.education.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-700/40 hover:border-slate-200 dark:hover:border-slate-600/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/25 flex items-center justify-center mt-0.5"><GraduationCap className="w-4 h-4 text-primary-600 dark:text-primary-400" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{edu.degree} in {edu.field}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{edu.institution}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}{edu.grade ? ` · ${edu.grade}` : ''}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteEducation(edu.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      {activeTab === 'skills' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy dark:text-white">Skills</h2>
            <button onClick={() => setShowSkillForm(true)} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {showSkillForm && (
            <div className="flex items-end gap-3 mb-4 p-4 bg-primary-50/30 dark:bg-primary-900/10 rounded-xl border border-primary-200 dark:border-primary-800/40">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Skill Name</label>
                <input value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} className={inputClass} placeholder="e.g. React" />
              </div>
              <div className="w-36">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Level</label>
                <select value={newSkill.proficiency} onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })} className={inputClass}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <button onClick={addSkill} className="px-4 py-2.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700">Add</button>
              <button onClick={() => setShowSkillForm(false)} className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
            </div>
          )}

          {profile.skills.length === 0 ? (
            <div className="text-center py-8"><Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" /><p className="text-sm text-slate-500 dark:text-slate-400">No skills added</p></div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => {
                const colors = [
                  'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/40',
                  'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800/40',
                  'bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#0B1120] dark:text-slate-300 dark:border-slate-700/50',
                  'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/40',
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <div key={skill.id} className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${colorClass}`}>
                    <span className="text-sm font-medium">{skill.name}</span>
                    <span className="text-[10px] font-bold uppercase opacity-70">{skill.proficiency}</span>
                    <button onClick={() => deleteSkill(skill.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/50 dark:hover:bg-black/20 rounded transition-all ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Internship Preferences</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Preferred Locations (comma-separated)</label>
              <input value={prefForm.locations} onChange={(e) => setPrefForm({ ...prefForm, locations: e.target.value })}
                className={inputClass} placeholder="e.g. Bengaluru, Mumbai, Remote" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Preferred Types</label>
              <div className="flex gap-2 flex-wrap">
                {['REMOTE', 'ONSITE', 'HYBRID'].map((type) => (
                  <button key={type} type="button"
                    onClick={() => setPrefForm({ ...prefForm, types: prefForm.types.includes(type) ? prefForm.types.filter((t) => t !== type) : [...prefForm.types, type] })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${prefForm.types.includes(type) ? 'bg-primary-50 dark:bg-primary-900/25 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Preferred Industries (comma-separated)</label>
              <input value={prefForm.industries} onChange={(e) => setPrefForm({ ...prefForm, industries: e.target.value })}
                className={inputClass} placeholder="e.g. Technology, AI/ML, Design" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Minimum Stipend (₹/month)</label>
              <input type="number" value={prefForm.minStipend} onChange={(e) => setPrefForm({ ...prefForm, minStipend: e.target.value })}
                className={inputClass} placeholder="e.g. 15000" />
            </div>
          </div>
          <button onClick={savePreferences} disabled={saving} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  );
}
