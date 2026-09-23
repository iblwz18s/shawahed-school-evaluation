'use client';

import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * أكورديون (Accordion) — مكوّن عام قابل لإعادة الاستخدام
 * -----------------------------------------------------
 * بلا أي مكتبة خارجية: React + Tailwind + lucide-react فقط.
 * (بدائل مثل Radix Accordion أو Preline JS تضيف اعتمادًا جديدًا
 *  ولا حاجة لها هنا.)
 *
 * الأنيميشن يعتمد على الانتقال من `grid-rows-[0fr]` إلى `grid-rows-[1fr]`
 * وهو أسلوب يقيس ارتفاع المحتوى تلقائيًا فلا يحتاج حساب ارتفاع بالـJavaScript،
 * ويعمل بسلاسة مع أي محتوى متغيّر الطول.
 *
 * RTL: كل المسافات تستخدم gap و ms/me ولا تعتمد على ml/mr.
 *
 * إتاحة الوصول: الزر يحمل aria-expanded و aria-controls، واللوحة تحمل
 * role="region" و aria-labelledby. وعند الإغلاق تُصبح اللوحة
 * `invisible` فتخرج روابطها من ترتيب التنقل بلوحة المفاتيح.
 */

export interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

/** حاوية تراصّ عناصر الأكورديون بتباعد موحّد */
export const Accordion: React.FC<AccordionProps> = ({ children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>{children}</div>
);

export interface AccordionItemProps {
  /** العنوان الرئيسي البارز */
  title: React.ReactNode;
  /** شارة صغيرة تسبق العنوان، مثل رمز المعيار */
  eyebrow?: React.ReactNode;
  /** سطر توضيحي باهت أسفل العنوان */
  subtitle?: React.ReactNode;
  /** محتوى الطرف المقابل من الصف: عدّادات أو شارات */
  meta?: React.ReactNode;
  /** يفتح العنصر عند أول عرض */
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  eyebrow,
  subtitle,
  meta,
  defaultOpen = false,
  children,
  className = '',
}) => {
  const [open, setOpen] = useState(defaultOpen);
  // useId يولّد معرّفات تحتوي على ":" وهي غير صالحة في محددات CSS، فتُنقّى هنا
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;

  return (
    <div
      className={`border rounded-xl overflow-hidden bg-white transition-colors ${
        open ? 'border-moe-300 shadow-sm' : 'border-slate-200 hover:border-moe-300'
      } ${className}`}
    >
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center justify-between gap-3 p-3.5 text-right transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-moe-600/40"
      >
        <div className="flex items-start gap-2.5 min-w-0">
          {eyebrow}
          <div className="min-w-0 space-y-0.5">
            <span
              className={`block text-xs sm:text-[13px] font-bold leading-snug transition-colors ${
                open ? 'text-moe-900' : 'text-slate-800'
              }`}
            >
              {title}
            </span>
            {subtitle && (
              <span className="block text-[11px] text-slate-500 leading-snug">{subtitle}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {meta}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 shrink-0 ${
              open ? 'rotate-180 text-moe-700' : 'text-slate-400'
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3.5 pb-3.5 pt-3 border-t border-slate-100">{children}</div>
        </div>
      </div>
    </div>
  );
};
