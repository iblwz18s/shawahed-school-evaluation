'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function ReportPrintButton() {
  const handlePrint = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-98"
      title="طباعة أو تصدير التقرير كـ PDF مباشرة"
    >
      <Printer className="w-4 h-4" />
      <span>طباعة / حفظ PDF</span>
    </button>
  );
}
