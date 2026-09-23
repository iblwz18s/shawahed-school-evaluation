import React from 'react';

/**
 * حلقة تقدّم (Progress Ring) — مكوّن عام قابل لإعادة الاستخدام
 * ----------------------------------------------------------
 * SVG خالص بلا أي مكتبة، مع انتقال ناعم على طول القوس.
 *
 * ملاحظة تقنية: بداية القوس من الأعلى (12) تُضبط بخاصية SVG الأصلية
 * `transform="rotate(-90 cx cy)"` على المجموعة، لا بكلاس CSS مثل `-rotate-90`.
 * السبب أن `transform-origin` الافتراضي داخل SVG يختلف بين المتصفحات،
 * أما خاصية `transform` الأصلية فتُطبّق حول النقطة المحدّدة بدقة في كل المتصفحات.
 */

export interface ProgressRingProps {
  /** النسبة من 0 إلى 100 */
  value: number;
  /** قطر الحلقة بالبكسل */
  size?: number;
  /** سماكة القوس بالبكسل */
  thickness?: number;
  /** النص داخل الحلقة، الافتراضي هو النسبة نفسها */
  label?: React.ReactNode;
  /** سطر صغير أسفل النص داخل الحلقة */
  caption?: string;
  /** كلاس لون القوس */
  colorClass?: string;
  /** كلاس لون المسار الخلفي */
  trackClass?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 116,
  thickness = 10,
  label,
  caption,
  colorClass = 'stroke-moe-700',
  trackClass = 'stroke-slate-100',
  className = '',
}) => {
  const clamped = Math.min(Math.max(Math.round(value), 0), 100);
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${clamped}%`}
        className="block"
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className={trackClass}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            className={`${colorClass} transition-[stroke-dashoffset] duration-700 ease-out`}
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl sm:text-2xl font-black text-moe-800 tabular-nums dir-ltr">
          {label ?? `${clamped}%`}
        </span>
        {caption && (
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
};
