'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Ban,
  Check,
} from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // نموذج إضافة مستخدم جديد
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'admin'>('teacher');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إنشاء المستخدم');
      }

      showToast('تم إنشاء الحساب بنجاح');
      setShowAddForm(false);
      setName('');
      setEmail('');
      setPassword('');
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
      });
      if (res.ok) {
        showToast(`تم ${user.isActive ? 'تعطيل' : 'تفعيل'} الحساب`);
        loadUsers();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-moe-700" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <span>لوحة تحكم المدير</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-moe-700" />
            <span>إدارة الكادر والمستخدمين ({users.length})</span>
          </h1>
          <p className="text-xs text-slate-500">
            إضافة المعلمين، تعيين الصلاحيات، وتفعيل أو تعطيل الحسابات
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'إلغاء الإضافة' : 'إضافة حساب جديد'}</span>
        </button>
      </div>

      {/* نموذج إضافة حساب جديد */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 border border-moe-200 shadow-md space-y-4 animate-in fade-in duration-200">
          <h2 className="text-base font-bold text-slate-900">إضافة مستخدم جديد للنظام</h2>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أ. عبدالله بن سعد..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الدور والصلاحية</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
              >
                <option value="teacher">معلم (رفع ومتابعة الشواهد)</option>
                <option value="admin">مدير المدرسة (اعتماد وإشراف كامل)</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-moe-800 hover:bg-moe-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
              >
                {submitting ? 'جاري الإنشاء...' : 'حفظ المستخدم'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* جدول المستخدمين */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3.5 px-4 font-bold">المستخدم</th>
                <th className="py-3.5 px-4 font-bold">البريد الإلكتروني</th>
                <th className="py-3.5 px-4 font-bold text-center">الدور</th>
                <th className="py-3.5 px-4 font-bold text-center">الحالة</th>
                <th className="py-3.5 px-4 font-bold text-center">الشواهد المرفوعة</th>
                <th className="py-3.5 px-4 font-bold text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    {u.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-moe-700" />
                    ) : (
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px] dir-ltr text-right">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-moe-50 text-moe-800 border border-moe-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role === 'admin' ? 'مدير' : 'معلم'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {u.isActive ? 'فعّال' : 'معطّل'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {u._count?.submittedEvidences || 0}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleUserStatus(u)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                        u.isActive
                          ? 'text-rose-700 border-rose-200 hover:bg-rose-50'
                          : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
