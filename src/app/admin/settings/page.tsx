'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Settings,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Building,
  Calendar,
  Shield,
  Save,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [educationDepartment, setEducationDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [schoolType, setSchoolType] = useState('government');
  const [publicPortalEnabled, setPublicPortalEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.user || meData.user.role !== 'admin') {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.setting) {
            setSchoolName(data.setting.schoolName || '');
            setEducationDepartment(data.setting.educationDepartment || '');
            setAcademicYear(data.setting.academicYear || '');
            setSchoolType(data.setting.schoolType || 'government');
            setPublicPortalEnabled(data.setting.publicPortalEnabled ?? true);
          }
        }
      } catch (err) {
        console.error('Fetch settings error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName,
          educationDepartment,
          academicYear,
          schoolType,
          publicPortalEnabled,
        }),
      });

      if (res.ok) {
        showToast('تم حفظ إعدادات المدرسة بنجاح');
        router.refresh();
      } else {
        alert('فشل حفظ الإعدادات');
      }
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس */}
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
            <Settings className="w-6 h-6 text-moe-700" />
            <span>إعدادات المدرسة والمنصة</span>
          </h1>
          <p className="text-xs text-slate-500">
            تخصيص اسم المدرسة، الإدارة التعليمية، العام الدراسي، ونوع المدرسة
          </p>
        </div>
      </div>

      {/* نموذج الإعدادات */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم المدرسة الرسمي
            </label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              إدارة التعليم التابعة لها المدرسة
            </label>
            <input
              type="text"
              required
              value={educationDepartment}
              onChange={(e) => setEducationDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                العام الدراسي الافتراضي
              </label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع المدرسة
              </label>
              <select
                value={schoolType}
                onChange={(e) => setSchoolType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600"
              >
                <option value="government">مدرسة حكومية (49 مؤشر)</option>
                <option value="private">مدرسة أهلية / عالمية (52 مؤشر)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                في المدارس الحكومية، يتم استبعاد المؤشرات الثلاثة الخاصة بالملاءة المالية والكوادر من حساب الاكتمال.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publicPortalEnabled}
                onChange={(e) => setPublicPortalEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-moe-700 focus:ring-moe-600"
              />
              <span className="text-xs font-semibold text-slate-800">
                تفعيل البوابة العامة لفريق التقويم الخارجي والزوار
              </span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
}
