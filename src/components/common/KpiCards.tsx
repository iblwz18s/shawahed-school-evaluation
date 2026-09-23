import React from 'react';
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';

/**
 * بطاقات المؤشرات (KPI Cards)
 * --------------------------
 * مكوّن عام قابل لإعادة الاستخدام ببنية "شبكة موصولة" — أي أن البطاقات
 * تتشارك إطارًا واحدًا وتفصلها خطوط داخلية رفيعة بدل تكرار إطار وظل لكل بطاقة.
 *
 * - لا يحتاج أي مكتبة خارجية: Tailwind + lucide-react فقط.
 * - RTL بالكامل: يستخدم ms/me ولا يعتمد على ml/mr.
 * - بلا حركة معقّدة: انتقالات CSS فقط (transition-colors).
 */

/** نغمات الألوان المتاحة، مبنية على هوية المشروع (moe) والذهبي (gold) */
export type KpiTone = 'default' | 'moe' | 'gold' | 'emerald' | 'amber' | 'rose';

/** شارة صغيرة أسفل القيمة — سهم اتجاه اختياري */
export interface KpiBadge {
  text: React.ReactNode;
  /** 'up' أو 'down' يرسم سهم اتجاه، و 'none' يعرض شارة محايدة بلا سهم */
  direction?: 'up' | 'down' | 'none';
  /** لون الشارة، وإن لم يُحدَّد يأخذ نغمة البطاقة */
  tone?: KpiTone;
}

export interface KpiCardProps {
  /** وصف المؤشر (يظهر أعلى البطاقة) */
  label: string;
  /** القيمة الرئيسية، عادةً رقم */
  value: React.ReactNode;
  /** سطر توضيحي صغير أسفل القيمة */
  hint?: string;
  /** أيقونة من lucide-react */
  icon: LucideIcon;
  /** نغمة البطاقة (تلوّن الأيقونة والقيمة وخلفية خفيفة) */
  tone?: KpiTone;
  /** شارة اختيارية بجانب السطر التوضيحي */
  badge?: KpiBadge;
  className?: string;
}

export interface KpiGridProps {
  /** كلاسات أعمدة الشبكة، الافتراضي: عمودان للجوال وحتى 6 أعمدة للشاشات الكبيرة */
  columns?: string;
  children: React.ReactNode;
  className?: string;
}

type ToneStyle = {
  /** خلفية الخلية نفسها */
  cell: string;
  /** مربّع الأيقونة */
  chip: string;
  /** لون رقم القيمة */
  value: string;
  /** شارة بلا سهم */
  badge: string;
};

const TONE_STYLES: Record<KpiTone, ToneStyle> = {
  default: {
    cell: 'bg-white hover:bg-slate-50',
    chip: 'bg-slate-100 border-slate-200 text-slate-600 group-hover:bg-slate-200/70',
    value: 'text-slate-900',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  moe: {
    cell: 'bg-gradient-to-b from-moe-50 to-white hover:from-moe-100',
    chip: 'bg-moe-50 border-moe-200 text-moe-700 group-hover:bg-moe-100',
    value: 'text-moe-800',
    badge: 'bg-moe-50 text-moe-800 border-moe-200',
  },
  gold: {
    cell: 'bg-gradient-to-b from-gold-50 to-white hover:from-gold-100',
    chip: 'bg-gold-50 border-gold-200 text-gold-700 group-hover:bg-gold-100',
    value: 'text-gold-800',
    badge: 'bg-gold-50 text-gold-800 border-gold-200',
  },
  emerald: {
    cell: 'bg-gradient-to-b from-emerald-50 to-white hover:from-emerald-100',
    chip: 'bg-emerald-50 border-emerald-200 text-emerald-700 group-hover:bg-emerald-100',
    value: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  amber: {
    cell: 'bg-gradient-to-b from-amber-50 to-white hover:from-amber-100',
    chip: 'bg-amber-50 border-amber-200 text-amber-700 group-hover:bg-amber-100',
    value: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  rose: {
    cell: 'bg-gradient-to-b from-rose-50 to-white hover:from-rose-100',
    chip: 'bg-rose-50 border-rose-200 text-rose-700 group-hover:bg-rose-100',
    value: 'text-rose-700',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

/**
 * الحاوية: شبكة موصولة بإطار واحد وخطوط فاصلة داخلية.
 * تعتمد على `gap-px` فوق خلفية رمادية لإنتاج الخطوط الفاصلة،
 * وهي طريقة آمنة اتجاهيًا (تعمل بشكل صحيح في RTL بلا ml/mr).
 */
export const KpiGrid: React.FC<KpiGridProps> = ({
  columns = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  children,
  className = '',
}) => (
  <div
    className={`grid ${columns} gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm ${className}`}
  >
    {children}
  </div>
);

/** بطاقة مؤشر واحدة */
export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  badge,
  className = '',
}) => {
  const styles = TONE_STYLES[tone];
  const badgeStyles = TONE_STYLES[badge?.tone ?? tone].badge;

  return (
    <div
      className={`group flex flex-col justify-between gap-2.5 p-4 sm:p-5 transition-colors ${styles.cell} ${className}`}
    >
      {/* العنوان + الأيقونة */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] sm:text-xs font-bold text-slate-500 leading-snug">
          {label}
        </span>
        <span
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${styles.chip}`}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>

      {/* القيمة الرئيسية */}
      <div className={`text-2xl sm:text-3xl font-black tabular-nums leading-none ${styles.value}`}>
        {value}
      </div>

      {/* الشارة + السطر التوضيحي */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 min-h-[1.375rem]">
        {badge && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeStyles}`}
          >
            {badge.direction === 'up' && <ArrowUp className="w-3 h-3 shrink-0" aria-hidden="true" />}
            {badge.direction === 'down' && (
              <ArrowDown className="w-3 h-3 shrink-0" aria-hidden="true" />
            )}
            <span>{badge.text}</span>
          </span>
        )}
        {hint && <span className="text-[11px] text-slate-500 leading-snug">{hint}</span>}
      </div>
    </div>
  );
};
