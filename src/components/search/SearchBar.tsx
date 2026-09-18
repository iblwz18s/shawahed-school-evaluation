'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, CheckCircle, ArrowLeft, BookOpen } from 'lucide-react';

export const SearchBar: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search fetch error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/indicators/${encodeURIComponent(code)}`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-slate-200/80 bg-white focus-within:border-moe-600 focus-within:ring-2 focus-within:ring-moe-600/20 transition-all">
        <div className="pr-4.5 pl-2 text-slate-400">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-moe-700" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="ابحث برقم المؤشر (مثال: 1-1-1-1) أو نص المعيار والمؤشر..."
          className="w-full py-4 pl-4 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="pl-4 text-xs text-slate-400 hover:text-slate-600"
          >
            مسح
          </button>
        )}
      </div>

      {/* القائمة المنسدلة لنتائج البحث */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
          {results.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                نتائج البحث ({results.length})
              </div>
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.code)}
                  className="w-full text-right p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-moe-800 bg-moe-50 px-2 py-0.5 rounded border border-moe-200 dir-ltr inline-block">
                        {item.code}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.domainName} • {item.standardName}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 group-hover:text-moe-900 line-clamp-2 leading-snug">
                      {item.text}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pt-0.5">
                    {item.hasApproved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        {item.approvedEvidencesCount} شاهد معتمد
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        بدون شاهد
                      </span>
                    )}
                    <span className="text-xs text-moe-600 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 mt-1 transition-opacity">
                      عرض <ArrowLeft className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-700">
                لم يتم العثور على مؤشر مطابق لبحثك.
              </p>
              <p className="text-xs text-slate-400">
                جرب البحث برقم المؤشر مثل <span className="font-mono text-moe-800 font-bold">1-1-1-1</span> أو بكلمات أساسية مثل (خطة، نواتج، بيئة).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
