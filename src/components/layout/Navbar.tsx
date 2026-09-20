'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogIn,
  LogOut,
  User,
  LayoutDashboard,
  FileCheck2,
  BookOpen,
  Menu,
  X,
  ExternalLink,
  ChevronLeft,
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

  const schoolName = schoolSetting?.schoolName || 'ابتدائية سعد بن أبي وقاص';
  const educationDept =
    schoolSetting?.educationDepartment || 'إدارة التعليم بمنطقة الحدود الشمالية';
  const ministryLogo = schoolSetting?.ministryLogoUrl || '/images/moe-logo.png';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* الشريط العلوي الرسمي لهوية وزارة التعليم - متجاوب تماماً مع الجوال */}
      <div className="bg-moe-950 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-8 border-b border-moe-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4 text-center sm:text-right">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="text-slate-300">المملكة العربية السعودية</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200 font-medium truncate max-w-[240px] sm:max-w-none">{educationDept}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline-block text-slate-300">
              العام الدراسي: {schoolSetting?.academicYear || '١٤٤٧-١٤٤٨هـ'}
            </span>
            <span className="text-emerald-300 text-[10px] sm:text-[11px] bg-moe-900/90 px-2 py-0.5 rounded border border-moe-800 font-medium">
              معايير الإصدار الثاني 2026م
            </span>
          </div>
        </div>
      </div>

      {/* الهيدر الرئيسي - حماية كاملة من تداخل العناصر على الشاشات الصغيرة */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 min-h-[4.5rem] sm:h-20 py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* هوية المدرسة مع الشعار الرسمي لوزارة التعليم */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group min-w-0">
            {/* الشعار الرسمي لوزارة التعليم بدلاً من الأيقونة */}
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 sm:p-1.5 shadow-xs border border-slate-200/90 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all overflow-hidden">
              <img
                src={ministryLogo}
                alt="شعار وزارة التعليم"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // في حال تعذر المسار الخارجي يتم الرجوع للصورة المحلية
                  (e.target as HTMLImageElement).src = '/images/moe-logo.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold text-moe-700 bg-moe-50 px-2 py-0.5 rounded border border-moe-200/60 whitespace-nowrap">
                  شواهد التقويم المدرسي
                </span>
              </div>
              <h1 className="text-xs sm:text-base md:text-lg font-black text-slate-900 tracking-tight mt-0.5 truncate">
                {schoolName}
              </h1>
            </div>
          </Link>
        </div>

        {/* روابط سطح المكتب */}
        <nav className="hidden md:flex items-center gap-6 shrink-0">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === '/' ? 'text-moe-800 font-bold' : 'text-slate-600 hover:text-slate-900'
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
                ? 'text-moe-800 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            أدوات التقويم (12)
          </Link>
        </nav>

        {/* أزرار الحساب لشاشات الكمبيوتر */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <Link
                href={currentUser.role === 'admin' ? '/admin' : '/staff'}
                className="flex items-center gap-2 bg-moe-800 hover:bg-moe-900 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-xs hover:shadow"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                <span>
                  {currentUser.role === 'admin' ? 'لوحة تحكم المدير' : 'لوحة المعلم'}
                </span>
                <span className="text-[11px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-semibold">
                  {currentUser.role === 'admin' ? 'مدير' : 'معلم'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600 text-sm px-2.5 py-2 rounded-xl hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-semibold">خروج</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-white bg-moe-800 hover:bg-moe-900 border border-moe-900 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-xs hover:shadow"
            >
              <LogIn className="w-4 h-4 text-emerald-200" />
              <span>دخول المنسوبين</span>
            </Link>
          )}
        </div>

        {/* أزرار الجوال: تم ضبط التباعد وتجنب التداخل التام */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
          {currentUser ? (
            <Link
              href={currentUser.role === 'admin' ? '/admin' : '/staff'}
              className="text-xs bg-moe-800 hover:bg-moe-900 text-white px-3 py-2 rounded-xl font-bold transition-colors whitespace-nowrap shadow-xs flex items-center gap-1"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-300" />
              <span>لوحة التحكم</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs text-white bg-moe-800 hover:bg-moe-900 border border-moe-900 px-3 py-2 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1 shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-200" />
              <span>دخول</span>
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* قائمة الجوال المنسدلة بتصميم عصري وأزرار لمس مريحة */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-2.5 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              pathname === '/' ? 'bg-moe-50 text-moe-900' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>الصفحة الرئيسية</span>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </Link>
          <Link
            href="/#domains-section"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>المجالات والمعايير الـ 4</span>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </Link>
          <Link
            href="/about-evaluation"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              pathname === '/about-evaluation' ? 'bg-moe-50 text-moe-900' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>أدوات التقويم المدرسي (12)</span>
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </Link>

          {currentUser ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="px-3.5 py-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{currentUser.name}</span>
                <span className="bg-moe-100 text-moe-800 font-bold px-2 py-0.5 rounded-md">
                  {currentUser.role === 'admin' ? 'مدير المدرسة' : 'معلم'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-right px-3.5 py-2.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-moe-800 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل دخول المعلمين والإدارة</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
