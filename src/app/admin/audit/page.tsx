'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  History,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  PlusCircle,
  Trash2,
  Pencil,
  UserCheck,
  Settings,
} from 'lucide-react';
import { AuditLogItem } from '@/types';

export default function AdminAuditPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    async function loadLogs() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.user || meData.user.role !== 'admin') {
          router.push('/login');
          return;
        }

        const res = await fetch(`/api/admin/audit?action=${actionFilter}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Audit load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [actionFilter, router]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'APPROVE_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            اعتماد شاهد
          </span>
        );
      case 'REJECT_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            رفض شاهد
          </span>
        );
      case 'SUBMIT_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            إضافة شاهد
          </span>
        );
      case 'EDIT_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            تعديل شاهد
          </span>
        );
      case 'DELETE_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
            حذف شاهد
          </span>
        );
      case 'CREATE_USER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            إنشاء مستخدم
          </span>
        );
      case 'UPDATE_SETTINGS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            تحديث الإعدادات
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {action}
          </span>
        );
    }
  };

  const parseMetadata = (meta: string | null) => {
    if (!meta) return null;
    try {
      return JSON.parse(meta);
    } catch {
      return null;
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
            <History className="w-6 h-6 text-moe-700" />
            <span>سجل العمليات والتدقيق (Audit Log)</span>
          </h1>
          <p className="text-xs text-slate-500">
            توثيق زمني غير قابل للتلاعب لجميع عمليات الرفع والاعتماد والرفض والتعديل
          </p>
        </div>

        {/* فلتر الإجراءات */}
        <div className="self-start">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-moe-600 font-medium"
          >
            <option value="all">كافة الإجراءات المسجلة</option>
            <option value="APPROVE_EVIDENCE">الاعتمادات فقط</option>
            <option value="REJECT_EVIDENCE">عمليات الرفض فقط</option>
            <option value="SUBMIT_EVIDENCE">إضافات الشواهد</option>
            <option value="EDIT_EVIDENCE">تعديلات الشواهد</option>
            <option value="CREATE_USER">إنشاء المستخدمين</option>
            <option value="UPDATE_SETTINGS">تغيير الإعدادات</option>
          </select>
        </div>
      </div>

      {/* جدول السجل */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3.5 px-4 font-bold">التاريخ والوقت</th>
                  <th className="py-3.5 px-4 font-bold">القائم بالعملية</th>
                  <th className="py-3.5 px-4 font-bold">نوع الإجراء</th>
                  <th className="py-3.5 px-4 font-bold">التفاصيل والمعلومات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const meta = parseMetadata(log.metadata);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('ar-SA')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {log.userName || 'مستخدم النظام'}
                      </td>
                      <td className="py-3.5 px-4">{getActionBadge(log.action)}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {meta ? (
                          <div className="space-y-0.5">
                            {meta.title && (
                              <div>
                                <strong className="text-slate-800">الشاهد: </strong>
                                <span>{meta.title}</span>
                              </div>
                            )}
                            {meta.indicatorCode && (
                              <span className="font-mono text-[11px] text-moe-800 font-bold dir-ltr inline-block">
                                مؤشر: {meta.indicatorCode}
                              </span>
                            )}
                            {meta.reason && (
                              <div className="text-rose-700 bg-rose-50 p-1.5 rounded text-[11px]">
                                <strong>السبب: </strong>
                                <span>{meta.reason}</span>
                              </div>
                            )}
                            {meta.schoolName && (
                              <span className="text-slate-500">
                                اسم المدرسة: {meta.schoolName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-bold text-slate-800">لا توجد عمليات مسجلة تطابق التصفية الحالية.</p>
          </div>
        )}
      </div>
    </div>
  );
}
