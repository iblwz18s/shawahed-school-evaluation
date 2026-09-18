import React from 'react';

export function LandingBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1. توهج ضوئي علوي بلون زمردي خافت */}
      <div
        className="absolute -top-24 -right-16 w-[440px] h-[440px] rounded-full blur-[80px]"
        style={{ background: "rgba(20, 120, 95, 0.08)" }}
      />
      {/* 2. توهج ضوئي سفلي مائل للخضرة الهادئة */}
      <div
        className="absolute -bottom-24 -left-20 w-[480px] h-[480px] rounded-full blur-[90px]"
        style={{ background: "rgba(35, 140, 110, 0.07)" }}
      />
      {/* 3. الرسومات التوضيحية والخطوط المنحنية (SVG Paths) */}
      <svg
        className="absolute top-0 left-0 w-full h-[60%] opacity-25"
        viewBox="0 0 800 700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-40,120 C220,300 520,60 900,340"
          stroke="rgba(20, 120, 95, 0.3)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-40,360 C260,180 560,520 900,240"
          stroke="rgba(20, 120, 95, 0.2)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
      {/* 4. عناقيد النقاط الشبكية الخافتة على الأطراف */}
      <div
        className="absolute top-[30%] left-[2%] w-[120px] h-[150px] opacity-20"
        style={{
          backgroundImage: "radial-gradient(rgba(20, 120, 95, 0.4) 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
          WebkitMaskImage: "radial-gradient(closest-side, #000 40%, transparent 100%)",
          maskImage: "radial-gradient(closest-side, #000 40%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-[50%] right-[3%] w-[140px] h-[120px] opacity-20"
        style={{
          backgroundImage: "radial-gradient(rgba(20, 120, 95, 0.4) 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
          WebkitMaskImage: "radial-gradient(closest-side, #000 40%, transparent 100%)",
          maskImage: "radial-gradient(closest-side, #000 40%, transparent 100%)",
        }}
      />
    </div>
  );
}
