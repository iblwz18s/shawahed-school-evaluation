'use client';

import React from 'react';
import { X, FileText, Link2, ArrowLeft, Layers } from 'lucide-react';

interface EvidenceChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: () => void;
  onSelectExternalLink: () => void;
  indicatorCode?: string;
}

export const EvidenceChoiceModal: React.FC<EvidenceChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectReport,
  onSelectExternalLink,
  indicatorCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* الرأس */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">كيف تريد إضافة الشاهد؟</h2>
            {indicatorCode && (
              <span className="text-xs text-slate-500 font-mono dir-ltr block text-right">
                المؤشر: {indicatorCode}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* الخيارين */}
        <div className="p-6 space-y-4">
          {/* الخيار الأول: إنشاء تقرير */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectReport();
            }}
            className="w-full text-right p-5 rounded-2xl border-2 border-slate-200 hover:border-moe-600 hover:bg-moe-50/30 transition-all flex items-start gap-4 group shadow-sm hover:shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-moe-50 text-moe-800 border border-moe-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-moe-800 group-hover:text-white transition-all">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-moe-950 text-base">
                  إنشاء تقرير
                </span>
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-moe-800 group-hover:translate-x-[-3px] transition-all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                تقرير توثيق مدرسي A4 بالصور (برنامج / نشاط) وتوليد PDF فوري
              </p>
            </div>
          </button>

          {/* الخيار الثاني: إدراج رابط خارجي */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectExternalLink();
            }}
            className="w-full text-right p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all flex items-start gap-4 group shadow-sm hover:shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
              <Link2 className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-emerald-950 text-base">
                  إدراج رابط خارجي
                </span>
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-800 group-hover:translate-x-[-3px] transition-all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Google Drive، فيديو، ملف، مجلد أو رابط آخر
              </p>
            </div>
          </button>
        </div>

        {/* التذييل */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-500">
            يرتبط الشاهد تلقائياً بالمؤشر الحالي دون الحاجة لإعادة اختياره.
          </span>
        </div>
      </div>
    </div>
  );
};
