import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-navy dark:text-white outline-none focus:border-primary-400 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 transition-all";

export default function Settings() {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({ current: '', newPassword: '', confirm: '' });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password change feature available in production');
    setPasswordForm({ current: '', newPassword: '', confirm: '' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your account settings</p>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
        <h2 className="text-lg font-semibold text-navy dark:text-white mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /> Account Information
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-400">Role</span>
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">{user?.role}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B1120] rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-400">Member Since</span>
            <span className="text-sm text-slate-800 dark:text-slate-200">{new Date(user?.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
        <h2 className="text-lg font-semibold text-navy dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
            <input type="password" required value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">New Password</label>
            <input type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Confirm New Password</label>
            <input type="password" required value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className={inputClass} />
          </div>
          <button type="submit" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
