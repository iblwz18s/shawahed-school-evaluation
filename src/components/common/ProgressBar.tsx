import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  subLabel,
  size = 'md',
  showPercentage = true,
  colorClass = 'bg-moe-700',
}) => {
  const clamped = Math.min(Math.max(Math.round(value), 0), 100);

  const heightMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs text-slate-700 font-medium">
          <span>{label}</span>
          <div className="flex items-center gap-1">
            {subLabel && <span className="text-slate-500 font-normal">{subLabel}</span>}
            {showPercentage && (
              <span className="font-bold text-moe-900 dir-ltr inline-block">
                {clamped}%
              </span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightMap[size]} border border-slate-200/60`}>
        <div
          className={`${heightMap[size]} ${colorClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
