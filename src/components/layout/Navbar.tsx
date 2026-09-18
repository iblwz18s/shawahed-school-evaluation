'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap,
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  FileCheck2,
  BookOpen,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { UserSession, SchoolSettingItem } from '@/types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [schoolSetting, setSchoolSetting] = useState<SchoolSettingItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, settingsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/admin/settings'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }
        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          setSchoolSetting(sData.setting);
        }
      } catch (err) {
        console.error('Navbar load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const schoolName = schoolSetting?.schoolName || 'ثانوية رواد المعرفة';
  const educationDept =
    schoolSetting?.educationDepartment || 'الإدارة العامة للتعليم بمنطقة الرياض';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* الشريط العلوي الرسمي لهوية وزارة التعليم */}
      <div className="bg-moe-950 text-white text-xs py-1.5 px-4 sm:px-8 border-b border-moe-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">المملكة العربية السعودية</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200 font-medium">{educationDept}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-slate-300">
              العام الدراسي: {schoolSetting?.academicYear || '1447-1448هـ / 2026م'}
            </span>
            <span className="text-slate-400 text-[11px] bg-moe-900 px-2 py-0.5 rounded border border-moe-800">
              معايير الإصدار الثاني 2026م
            </span>
          </div>
        </div>
      </div>

      {/* الهيدر الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* هوية المدرسة وشعار الوزارة */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3.5 group">
            {/* الشعار الرسمي لوزارة التعليم */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-moe-800 to-moe-950 flex items-center justify-center text-white shadow-md border border-moe-700/50 group-hover:scale-[1.02] transition-transform">
              <GraduationCap className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-moe-700 bg-moe-50 px-2 py-0.5 rounded border border-moe-200/60">
                  منصة شواهد التقويم المدرسي
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                {schoolName}
              </h1>
            </div>
          </Link>
        </div>

        {/* الروابط للكمبيوتر */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === '/' ? 'text-moe-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الرئيسية
          </Link>
          <Link
            href="/#domains-section"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            المجالات والمعايير
          </Link>
          <Link
            href="/about-evaluation"
            className={`text-sm font-medium transition-colors ${
              pathname === '/about-evaluation'
                ? 'text-moe-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            أدوات التقويم (12)
          </Link>
        </nav>

        {/* أزرار الدخول والحساب - زر غير مشتت للزائر كما طلبت الوثيقة */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link
                href={currentUser.role === 'admin' ? '/admin' : '/staff'}
                className="flex items-center gap-2 bg-moe-50 hover:bg-moe-100 text-moe-900 px-3.5 py-2 rounded-lg text-sm font-medium border border-moe-200 transition-colors shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-moe-700" />
                <span>
                  {currentUser.role === 'admin' ? 'لوحة تحكم المدير' : 'لوحة المعلم'}
                </span>
                <span className="text-xs bg-moe-700 text-white px-2 py-0.5 rounded-full font-semibold">
                  {currentUser.role === 'admin' ? 'مدير' : 'معلم'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 text-sm px-2.5 py-2 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs">خروج</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-slate-600 hover:text-moe-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              <span>دخول المنسوبين</span>
            </Link>
          )}
        </div>

        {/* زر القائمة للشاشات الصغيرة */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser ? (
            <Link
              href={currentUser.role === 'admin' ? '/admin' : '/staff'}
              className="text-xs bg-moe-800 text-white px-2.5 py-1.5 rounded-md font-medium"
            >
              لوحة التحكم
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-md font-medium"
            >
              دخول المنسوبين
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* قائمة الموبايل المنسدلة */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-3">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            الرئيسية
          </Link>
          <Link
            href="/#domains-section"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            المجالات والمعايير
          </Link>
          <Link
            href="/about-evaluation"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            أدوات التقويم المدرسي الـ 12
          </Link>
          {currentUser && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">{currentUser.name}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 font-medium flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
