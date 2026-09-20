import React from 'react';

export function LandingBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 1. توهج ضوئي علوي بلون زمردي واضح وأنيق */}
      <div
        className="absolute -top-28 -right-20 w-[550px] h-[550px] rounded-full blur-[70px]"
        style={{ background: "radial-gradient(circle, rgba(13, 148, 128, 0.22) 0%, rgba(15, 118, 110, 0.12) 60%, transparent 80%)" }}
      />
      {/* 2. توهج ضوئي سفلي واضح ومتناسق */}
      <div
        className="absolute -bottom-28 -left-20 w-[550px] h-[550px] rounded-full blur-[70px]"
        style={{ background: "radial-gradient(circle, rgba(20, 184, 157, 0.20) 0%, rgba(13, 148, 128, 0.10) 60%, transparent 80%)" }}
      />
      {/* 3. توهج ذهبي دافئ لعمق بصري */}
      <div
        className="absolute top-1/3 right-1/4 w-[420px] h-[420px] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(209, 171, 94, 0.14) 0%, transparent 70%)" }}
      />

      {/* 4. خطوط ومنحنيات هندسية واضحة (SVG Paths) */}
      <svg
        className="absolute top-0 left-0 w-full h-[75%] opacity-70"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-50,150 C300,320 650,80 1250,380"
          stroke="rgba(15, 118, 110, 0.35)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M-50,380 C350,200 750,560 1250,260"
          stroke="rgba(20, 184, 157, 0.30)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M100,50 C450,220 850,-20 1250,180"
          stroke="rgba(13, 148, 128, 0.22)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          fill="none"
        />
      </svg>

      {/* 5. شبكة نقاط هندسية بارزة وواضحة المعالم على الأطراف */}
      <div
        className="absolute top-[20%] left-[2%] w-[180px] h-[220px] opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(15, 118, 110, 0.55) 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px",
          WebkitMaskImage: "radial-gradient(closest-side, #000 60%, transparent 100%)",
          maskImage: "radial-gradient(closest-side, #000 60%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-[45%] right-[2%] w-[180px] h-[200px] opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(15, 118, 110, 0.55) 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px",
          WebkitMaskImage: "radial-gradient(closest-side, #000 60%, transparent 100%)",
          maskImage: "radial-gradient(closest-side, #000 60%, transparent 100%)",
        }}
      />
    </div>
  );
}
