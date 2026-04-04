import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { ShieldCheck, Check, X, Clock, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Verifications() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVerifications(); }, []);

  const loadVerifications = async () => {
    try { const res = await adminAPI.getVerifications(); setVerifications(res.data.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const review = async (id, status) => {
    const notes = status === 'REJECTED' ? prompt('Reason for rejection:') : '';
    try { await adminAPI.reviewVerification(id, { status, notes }); toast.success(`Verification ${status.toLowerCase()}`); loadVerifications(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy dark:text-white">Recruiter Verifications</h1>

      {verifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50">
          <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No pending verifications</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => (
            <div key={v.id} className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 card-hover">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/25 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy dark:text-white">{v.recruiter.companyName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{v.recruiter.user?.email}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Registered {new Date(v.recruiter.user?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => review(v.id, 'APPROVED')} className="px-4 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => review(v.id, 'REJECTED')} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors">
                    <X className="w-3.5 h-3.5" /> Reject
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
