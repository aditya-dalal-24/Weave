import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const inputClass = "px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-navy dark:text-white outline-none focus:border-primary-400 dark:focus:border-primary-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function AdminUsers() {
  const [data, setData] = useState({ users: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', search: '', page: 1 });

  useEffect(() => { loadUsers(); }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try { const res = await adminAPI.getUsers(filters); setData(res.data.data); }
    catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (userId) => {
    try { const res = await adminAPI.toggleUserStatus(userId); toast.success(`User ${res.data.data.isActive ? 'activated' : 'deactivated'}`); loadUsers(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy dark:text-white">User Management</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className={`w-full pl-9 pr-3 ${inputClass}`} placeholder="Search by email..." />
        </div>
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })} className={inputClass}>
          <option value="">All Roles</option>
          <option value="CANDIDATE">Candidate</option><option value="RECRUITER">Recruiter</option><option value="ADMIN">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-700/50">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Joined</th>
                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.candidate ? `${u.candidate.firstName} ${u.candidate.lastName}` : u.recruiter ? u.recruiter.companyName : u.admin ? `${u.admin.firstName} ${u.admin.lastName}` : 'N/A'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${u.role === 'CANDIDATE' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : u.role === 'RECRUITER' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${u.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => toggleStatus(u.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      {u.isActive ? <ToggleRight className="w-5 h-5 text-green-600 dark:text-green-400" /> : <ToggleLeft className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800/50">
              <span className="text-xs text-slate-500 dark:text-slate-400">Page {data.pagination.page} of {data.pagination.pages}</span>
              <div className="flex gap-2">
                <button disabled={data.pagination.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="px-3 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Prev</button>
                <button disabled={data.pagination.page >= data.pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="px-3 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
