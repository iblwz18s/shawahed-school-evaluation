import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Eye,
  Building,
  Users,
  UserCheck,
  Award,
  BarChart3,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';

export default function AboutEvaluationPage() {
  const evaluationTools = [
    {
      id: 1,
      title: 'تحليل وثائق المدرسة',
      description: 'فحص ومراجعة الخطط التشغيلية، السجلات الرسمية، التقارير الدورية، والوثائق الإدارية والتربوية (وهو ما تدعمه هذه المنصة بشكل مباشر).',
      icon: <FileText className="w-5 h-5 text-moe-700" />,
      tag: 'تدعمه المنصة رقمياً',
    },
    {
      id: 2,
      title: 'الملاحظة الصفية',
      description: 'زيارة الفصول الدراسية للوقوف على استراتيجيات التدريس وتفاعل الطلاب وإدارة البيئة الصفية.',
      icon: <Eye className="w-5 h-5 text-emerald-700" />,
      tag: 'ميداني صفي',
    },
    {
      id: 3,
      title: 'ملاحظة البيئة التعليمية',
      description: 'معاينة المرافق المدرسية والمعامل والفناء ومصادر التعلم وتطبيق اشتراطات الأمن والسلامة والصيانة.',
      icon: <Building className="w-5 h-5 text-teal-700" />,
      tag: 'ميداني تفقد',
    },
    {
      id: 4,
      title: 'استبانة المتعلم',
      description: 'استطلاع آراء الطلاب حول جودة التعليم والبيئة المدرسية والأنشطة والرعاية النفسية والتربوية.',
      icon: <Users className="w-5 h-5 text-blue-700" />,
      tag: 'استبانة إلكترونية',
    },
    {
      id: 5,
      title: 'استبانة المعلم',
      description: 'قياس رضا المعلمين وملاحظاتهم حول التطوير المهني والمناخ التنظيمي والموارد المتاحة.',
      icon: <Users className="w-5 h-5 text-indigo-700" />,
      tag: 'استبانة إلكترونية',
    },
    {
      id: 6,
      title: 'استبانة الأسرة',
      description: 'استطلاع شراكة أولياء الأمور ورضاهم عن التواصل مع المدرسة ومتابعة التحصيل الدراسي لأبنائهم.',
      icon: <Users className="w-5 h-5 text-purple-700" />,
      tag: 'استبانة إلكترونية',
    },
    {
      id: 7,
      title: 'مقابلة الموجه الطلابي',
      description: 'الاطلاع على برامج التوجيه والإرشاد، رعاية السلوك الإيجابي، والخطط الموجهة لرعاية الموهوبين وذوي الإعاقة.',
      icon: <UserCheck className="w-5 h-5 text-sky-700" />,
      tag: 'مقابلة رسمية',
    },
    {
      id: 8,
      title: 'مقابلة الإدارة المدرسية',
      description: 'مناقشة الخطة التشغيلية، قيادة عمليات التطوير، المتابعة، والتقويم الذاتي للمدرسة.',
      icon: <UserCheck className="w-5 h-5 text-moe-700" />,
      tag: 'مقابلة رسمية',
    },
    {
      id: 9,
      title: 'مقابلة المتعلمين',
      description: 'الالتقاء بعينات من الطلاب لقياس دافعيتهم للتعلم ومشاركتهم في الأنشطة واستفادتهم من الخدمات المساندة.',
      icon: <UserCheck className="w-5 h-5 text-teal-700" />,
      tag: 'مقابلة رسمية',
    },
    {
      id: 10,
      title: 'مقابلة المعلمين',
      description: 'التحاور مع الكادر التعليمي حول استراتيجيات التدريس وتقويم نواتج التعلم وتطوير المهارات.',
      icon: <UserCheck className="w-5 h-5 text-emerald-700" />,
      tag: 'مقابلة رسمية',
    },
    {
      id: 11,
      title: 'الرخص المهنية للمعلمين',
      description: 'متابعة نسبة المعلمين الحاصلين على الرخص المهنية المعتمدة من هيئة تقويم التعليم والتدريب ودعم نموهم.',
      icon: <Award className="w-5 h-5 text-amber-700" />,
      tag: 'بيانات وطنية',
    },
    {
      id: 12,
      title: 'الاختبارات الوطنية',
      description: 'نتائج الاختبارات الوطنية (نافس) للمرحلتين الابتدائية والمتوسطة، والتحصيل الدراسي والقدرات العامة للمرحلة الثانوية.',
      icon: <BarChart3 className="w-5 h-5 text-rose-700" />,
      tag: 'قياس وطني',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* رأس الصفحة */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 bg-moe-50 text-moe-900 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-moe-200">
          <GraduationCap className="w-4 h-4 text-moe-700" />
          <span>المرجع: وثيقة معايير التقويم والتصنيف والاعتماد المدرسي لعام 2026م</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          أدوات التقويم المدرسي الـ 12
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          يوضح هذا القسم أن عمليات التقويم المدرسي والاعتماد الخارجي لمنظومة التعليم تعتمد على باقة متكاملة من 12 أداة نوعية وكمية وميدانية، ولا تقتصر على الوثائق والمستندات وحدها.
        </p>
      </div>

      {/* تنبيه دور المنصة المحدد في BRD */}
      <div className="bg-moe-50/80 border border-moe-200/90 rounded-2xl p-6 text-xs sm:text-sm text-moe-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-moe-900 text-sm sm:text-base">
          <CheckCircle2 className="w-5 h-5 text-moe-700 shrink-0" />
          <span>دور منصة شواهد التقويم المدرسي:</span>
        </div>
        <p className="leading-relaxed text-slate-700">
          تهدف هذه المنصة بالدرجة الأولى إلى رقمنة وتنظيم وتوثيق <strong>الأداة الأولى (تحليل وثائق المدرسة)</strong> وربط كل شاهد بالمؤشر الصحيح وتسهيل الوصول إليها لفريق التقويم الخارجي، ولا تدعي المنصة أنها تغطي جميع أدوات التقويم الميدانية الأخرى أو تمنح درجة التقويم الرسمية للمدرسة.
        </p>
      </div>

      {/* شبكة الأدوات الـ 12 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {evaluationTools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                  {tool.icon}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {tool.tag}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                <span className="text-moe-700 font-mono ml-1.5">{tool.id}.</span>
                {tool.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>أداة تقويم رسمية</span>
              <span className="font-mono">#0{tool.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* زر العودة للمؤشرات */}
      <div className="pt-6 border-t border-slate-200 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-moe-800 hover:bg-moe-900 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
        >
          <span>العودة إلى شواهد التقويم والمجالات</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
