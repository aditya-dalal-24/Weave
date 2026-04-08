import { useState, useEffect } from 'react';
import { candidateAPI } from '../../services/api';
import { Plus, Trash2, GraduationCap, Wrench, MapPin, Save, Lightbulb, X, User, Upload, FileText, CheckCircle2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-navy dark:text-white focus:border-primary-400 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function CandidateProfile() {
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Intermediate' });
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '', scale: ' / 10' });
  const [showEduForm, setShowEduForm] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [personalForm, setPersonalForm] = useState({ firstName: '', lastName: '', phone: '', address: '', gender: '', bio: '' });
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
      setPersonalForm({ firstName: p.firstName || '', lastName: p.lastName || '', phone: p.phone || '', address: p.address || '', gender: p.gender || '', bio: p.bio || '' });
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploadingAvatar(true);
    try {
      await candidateAPI.uploadAvatar(formData);
      toast.success('Profile photo updated!');
      loadProfile();
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setUploadingResume(true);
    toast.loading('Processing resume...', { id: 'resume' });
    try {
      const res = await candidateAPI.uploadResume(formData);
      toast.success('Resume uploaded successfully!', { id: 'resume' });
      if (res.data.extractedSkills && res.data.extractedSkills.length > 0) {
        toast.success(`Extracted skills: ${res.data.extractedSkills.join(', ')}`);
      }
      loadProfile();
    } catch (err) {
      toast.error('Failed to upload resume', { id: 'resume' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleExtractResume = async () => {
    setExtracting(true);
    toast.loading('Analyzing resume...', { id: 'extract' });
    try {
      const res = await candidateAPI.extractResume();
      let extractedMsg = 'Extracted: ';
      if (res.data.data.phone) extractedMsg += `Phone, `;
      if (res.data.data.links?.length > 0) extractedMsg += `Links, `;
      if (res.data.data.education?.length > 0) extractedMsg += `Education `;
      
      toast.success(extractedMsg || 'Resume extracted successfully', { id: 'extract' });
      loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extract resume', { id: 'extract' });
    } finally {
      setExtracting(false);
    }
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

  const saveEducation = async () => {
    if (!newEdu.institution || !newEdu.degree || !newEdu.field || !newEdu.startDate) {
      toast.error('Please fill required fields'); return;
    }
    try {
      // Format grade with scale if provided
      const formattedEdu = { ...newEdu };
      if (newEdu.grade && newEdu.scale) {
        if (newEdu.scale === '%') {
          formattedEdu.grade = `${newEdu.grade}%`;
        } else {
          formattedEdu.grade = `${newEdu.grade}${newEdu.scale}`;
        }
      }

      if (editingEdu) {
        await candidateAPI.updateEducation(editingEdu, formattedEdu);
        toast.success('Education updated!');
      } else {
        await candidateAPI.addEducation(formattedEdu);
        toast.success('Education added!');
      }
      setNewEdu({ institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '', scale: ' / 10' });
      setEditingEdu(null);
      setShowEduForm(false);
      loadProfile();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEditEducation = (edu) => {
    let parsedGrade = '';
    let parsedScale = ' / 10';
    
    if (edu.grade) {
      if (edu.grade.includes('%')) {
        parsedGrade = edu.grade.replace('%', '');
        parsedScale = '%';
      } else if (edu.grade.includes('/')) {
        const parts = edu.grade.split('/');
        parsedGrade = parts[0].trim();
        parsedScale = ` / ${parts[1].trim()}`;
      } else {
        parsedGrade = edu.grade;
      }
    }

    setNewEdu({ 
       institution: edu.institution, 
       degree: edu.degree, 
       field: edu.field, 
       startDate: edu.startDate ? new Date(edu.startDate).toISOString().substring(0, 10) : '', 
       endDate: edu.endDate ? new Date(edu.endDate).toISOString().substring(0, 10) : '', 
       grade: parsedGrade,
       scale: parsedScale
    });
    setEditingEdu(edu.id);
    setShowEduForm(true);
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
    { id: 'resume', label: 'Resume' },
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
          
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                {profile.avatar ? <img src={`http://localhost:5000${profile.avatar}`} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-400" />}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10">
                <span className="text-[10px] font-semibold">{uploadingAvatar ? '...' : 'Upload'}</span>
                <input type="file" accept="image/*" className="hidden" disabled={uploadingAvatar} onChange={handleAvatarUpload} />
              </label>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy dark:text-white">Profile Photo</h2>
              <p className="text-xs text-slate-500 mt-1">Upload a professional headshot</p>
            </div>
          </div>

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
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Gender</label>
              <select value={personalForm.gender} onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })} className={inputClass}>
                <option value="">Select Gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Address</label>
              <input value={personalForm.address} onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })} className={inputClass} placeholder="e.g. City, State, Country" />
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

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Resume Upload</h2>
          
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-[#0B1120]/50 mb-6 relative">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Upload your latest resume</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">PDF files only. We will automatically extract your skills to update your profile.</p>
            
            <label className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors inline-block relative">
              {uploadingResume ? 'Processing PDF...' : 'Select PDF File'}
              <input type="file" accept="application/pdf" className="hidden" disabled={uploadingResume} onChange={handleResumeUpload} />
            </label>
          </div>

          {profile.resumeUrl && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40 rounded-xl mt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-400">Resume Uploaded Successfully</p>
                  <p className="text-xs text-green-700 dark:text-green-500/70 truncate max-w-xs">{profile.resumeUrl.split('-').pop()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={handleExtractResume} disabled={extracting} className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50">
                    {extracting ? 'Extracting...' : 'Extract Details'}
                 </button>
                 <a href={`http://localhost:5000${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-green-700 dark:text-green-400 hover:underline border border-green-300 dark:border-green-800 rounded-md px-3 py-1.5 transition">View PDF</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Education */}
      {activeTab === 'education' && (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy dark:text-white">Education</h2>
            <button onClick={() => { setNewEdu({ institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' }); setEditingEdu(null); setShowEduForm(true); }} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {showEduForm && (
            <div className="border border-primary-200 dark:border-primary-800/40 rounded-xl p-4 mb-4 bg-primary-50/30 dark:bg-primary-900/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{editingEdu ? 'Edit Education' : 'New Education'}</span>
                <button onClick={() => { setShowEduForm(false); setEditingEdu(null); }}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input value={newEdu.institution} onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })} placeholder="Institution *" className={inputClass} />
                <input value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} placeholder="Degree *" className={inputClass} />
                <input value={newEdu.field} onChange={(e) => setNewEdu({ ...newEdu, field: e.target.value })} placeholder="Field of Study *" className={inputClass} />
                <div className="flex gap-2">
                  <input type="number" step="0.01" value={newEdu.grade} onChange={(e) => setNewEdu({ ...newEdu, grade: e.target.value })} placeholder="Grade / CGPA" className={`${inputClass} flex-1`} />
                  <select value={newEdu.scale} onChange={(e) => setNewEdu({ ...newEdu, scale: e.target.value })} className={`${inputClass} w-28`}>
                    <option value=" / 10">/ 10</option>
                    <option value=" / 4">/ 4</option>
                    <option value="%">%</option>
                  </select>
                </div>
                <input type="date" value={newEdu.startDate} onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })} className={inputClass} />
                <input type="date" value={newEdu.endDate} onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })} className={inputClass} />
              </div>
              <button onClick={saveEducation} className="px-4 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700">{editingEdu ? 'Update Education' : 'Add Education'}</button>
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
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditEducation(edu)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteEducation(edu.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Minimum Stipend (/month)</label>
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
