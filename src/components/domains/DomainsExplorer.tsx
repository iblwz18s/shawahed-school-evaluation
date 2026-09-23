'use client';

import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DomainCard, type DomainCardData } from './DomainCard';

/**
 * مستكشف المجالات (Domains Explorer) — قابل لإعادة الاستخدام
 * ---------------------------------------------------------
 * يعرض المجالات الأربعة كأزرار مدمجة فقط، وعند الضغط على أي زر
 * تنفتح بطاقة المجال كاملة **مباشرة أسفل الزر المضغوط** بأنيميشن ناعم
 * (نفس أسلوب الأكورديون: `grid-rows-[0fr]` → `grid-rows-[1fr]`).
 *
 * كيف يتحقّق "أسفل الزر مباشرة" في شبكة متعدّدة الأعمدة؟
 * -----------------------------------------------------
 * لوحة كل مجال تُدرج في ترتيب الشجرة **مباشرة بعد زرّه** لا بعد الشبكة كلها،
 * وتأخذ `col-span-full` فتمتد بعرض الصف كاملًا. ومع وجود `grid-flow-row-dense`
 * يعود المتصفح فيملأ الفراغات فتظل الأزرار متصفّة جنبًا إلى جنب كما ينبغي،
 * ويستقرّ كل صف لوحة في السطر التالي مباشرةً لصفّ زرّه.
 *
 * لذلك: على الجوال (عمود واحد) تظهر البطاقة فورًا تحت زرّها، وعلى الشاشات
 * المتوسطة والكبيرة تظهر تحت صفّ الأزرار الذي يحتوي زرّها.
 *
 * ملاحظتان تقنيتان:
 * - `gap-y-0` + `mb-3 sm:mb-4` على الأزرار: صفوف اللوحات المغلقة ارتفاعها صفر،
 *   فلو استخدمنا `gap-y` عاديًا لأضاف فراغًا ميّتًا لكل لوحة مغلقة.
 * - اللوحات المغلقة تبقى في الـDOM لكنها `invisible`، فيبقى المحتوى متاحًا
 *   وتخرج روابطها من ترتيب التنقّل بلوحة المفاتيح.
 *
 * بلا أي مكتبة خارجية: React + Tailwind + lucide-react.
 */

export interface DomainExplorerItem {
  domain: DomainCardData;
  /** أيقونة المجال (عنصر React من lucide-react) */
  icon: React.ReactNode;
}

export interface DomainsExplorerProps {
  items: DomainExplorerItem[];
  /** معرّف المجال الذي يُفتح عند أول عرض */
  defaultOpenId?: string | null;
  className?: string;
}

export const DomainsExplorer: React.FC<DomainsExplorerProps> = ({
  items,
  defaultOpenId = null,
  className = '',
}) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);
  // useId يولّد معرّفات تحتوي على ":" وهي غير صالحة في محددات CSS، فتُنقّى هنا
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const buttonId = (domainId: string) => `${baseId}-btn-${domainId}`;
  const panelId = (domainId: string) => `${baseId}-panel-${domainId}`;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-flow-row-dense gap-x-3 sm:gap-x-4 gap-y-0 ${className}`}
    >
      {items.map(({ domain, icon }) => {
        const isOpen = openId === domain.id;

        return (
          <React.Fragment key={domain.id}>
            {/* زر المجال المدمج */}
            <button
              type="button"
              id={buttonId(domain.id)}
              aria-expanded={isOpen}
              aria-controls={panelId(domain.id)}
              onClick={() => setOpenId(isOpen ? null : domain.id)}
              className={`group relative w-full text-right p-4 pb-5 mb-3 sm:mb-4 rounded-2xl border-2 transition-all overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-moe-600/40 ${
                isOpen
                  ? 'border-moe-500 bg-moe-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-moe-400 hover:shadow-md'
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-moe-100 border-moe-300'
                        : 'bg-moe-50 border-moe-200 group-hover:bg-moe-100'
                    }`}
                  >
                    {icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-extrabold text-moe-700 tracking-wider">
                      المجال {domain.code}
                    </span>
                    <span
                      className={`block text-sm font-black truncate transition-colors ${
                        isOpen ? 'text-moe-900' : 'text-slate-900'
                      }`}
                    >
                      {domain.name}
                    </span>
                  </span>
                </span>

                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-black text-moe-800 dir-ltr">
                    {domain.completionRate}%
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-moe-700' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </span>

              <span className="block mt-3 text-[11px] text-slate-500 font-medium">
                {domain.totalStandards} معايير · {domain.completedIndicators} من{' '}
                {domain.totalIndicators} مؤشر مكتمل
              </span>

              {/* شريط تقدّم رفيع أسفل الزر */}
              <span aria-hidden="true" className="absolute bottom-0 inset-x-0 h-1 bg-slate-100">
                <span
                  className="block h-full bg-moe-700 transition-all duration-500"
                  style={{ width: `${domain.completionRate}%` }}
                />
              </span>
            </button>

            {/* بطاقة المجال — تُدرج مباشرة بعد زرّها وتمتد بعرض الصف */}
            <div
              id={panelId(domain.id)}
              role="region"
              aria-labelledby={buttonId(domain.id)}
              className={`col-span-full grid transition-all duration-300 ease-out ${
                isOpen
                  ? 'grid-rows-[1fr] opacity-100 visible'
                  : 'grid-rows-[0fr] opacity-0 invisible'
              }`}
            >
              <div className="overflow-hidden">
                <DomainCard domain={domain} icon={icon} />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
