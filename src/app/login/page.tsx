'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Lock, Mail, AlertCircle, Loader2, GraduationCap, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      // التوجيه التلقائي حسب الدور كما نصت الوثيقة:
      // المدير -> /admin
      // المعلم -> /staff
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/staff');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الخادم');
    } finally {
      setLoading(false);
    }
  };

  // تعبئة سريعة للحسابات التجريبية
  const fillCredentials = (role: 'admin' | 'teacher') => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('teacher@example.com');
      setPassword('teacher123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* بطاقة الدخول */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center mx-auto p-2">
              <img
                src="/images/moe-logo.png"
                alt="شعار وزارة التعليم"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900">دخول المنسوبين</h1>
            <p className="text-xs text-slate-500">
              بوابة خاصة بمدير المدرسة والكادر التعليمي لإدارة شواهد التقويم
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moe-600/20 focus:border-moe-600 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moe-600/20 focus:border-moe-600 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* تعبئة تجريبية سريعة لتسهيل الفحص والتقييم */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 block text-center">
              حسابات تجريبية للمعاينة السريعة (Seed Accounts):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2 px-3 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-moe-700" />
                <span>حساب المدير</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('teacher')}
                className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2 px-3 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-moe-700" />
                <span>حساب المعلم</span>
              </button>
            </div>
          </div>
        </div>

        {/* رابط العودة للرئيسية */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← العودة إلى بوابة الزوار والتقويم الخارجي
          </Link>
        </div>
      </div>
    </div>
  );
}
