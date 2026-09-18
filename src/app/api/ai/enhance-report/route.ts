import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { ReportType } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const body = await req.json();
    const {
      reportType = 'program_activity',
      title = '',
      type = 'برنامج',
      subject = '',
      gradeLevel = '',
      notes = '',
    } = body;

    const safeTitle = (title || '').trim();
    const safeSubject = (subject || '').trim();

    // توليد محتوى ذكي ومقنن بأسلوب تربوي سعودي مهني ومباشر حسب نوع التقرير
    switch (reportType as ReportType) {
      case 'teaching_strategy': {
        const stratName = safeTitle || 'الاستراتيجية المطبقة';
        const subjText = safeSubject ? ` في مادة ${safeSubject}` : '';

        const enhancedObjectives = [
          `تفعيل المشاركة الإيجابية والتفاعل الصفي أثناء تطبيق ${stratName}${subjText}`,
          `تعميق استيعاب المفاهيم التعليمية الأساسية وربط المعرفة النظرية بالتطبيق العملي`,
          `تنمية مهارات التفكير والاستقصاء والعمل التعاوني لدى المتعلمين`,
        ];

        const enhancedSteps = [
          `التهيئة الحافزة للدرس وتوضيح أهداف وخطوات تطبيق ${stratName} للطلاب`,
          `تنظيم المجموعات الصفية وتوزيع المهام والأدوار بوضوح لتحقيق التعلم النشط`,
          `توجيه ومتابعة تنفيذ الأنشطة الصفية مع تقديم الدعم والتغذية الراجعة الفورية`,
          `غلق الدرس وتقويم مدى تحقق نواتج التعلم المستهدفة وعرض منجزات الطلاب`,
        ];

        const enhancedTools = [
          'بطاقات المهام وأوراق العمل التعاونية المنظمة',
          'الشاشة التفاعلية / العروض التقديمية المدعمة بالأمثلة',
          'أدوات التقويم السريع ومؤشرات الأداء الصفي',
        ];

        const enhancedOutcomes = [
          `ارتفاع التفاعل الإيجابي للطلاب داخل الحصة ومشاركتهم الفعالة في الأنشطة`,
          `تحسن ملحوظ في استيعاب المفاهيم المستهدفة بنسبة إتقان تتجاوز 85%`,
          `تعزيز روح التعلم الذاتي وحل المشكلات لدى الطلاب`,
        ];

        const enhancedNotes = notes?.trim() || `أظهر الطلاب استجابة متميزة أثناء التطبيق، ويُوصى بتكرار استخدام ${stratName} في الدروس والمفاهيم التطبيقية المشابهة.`;

        return NextResponse.json({
          success: true,
          reportType,
          enhanced: {
            objectives: enhancedObjectives,
            steps: enhancedSteps,
            tools: enhancedTools,
            outcomes: enhancedOutcomes,
            notes: enhancedNotes,
          },
        });
      }

      case 'meeting': {
        const enhancedSteps = [
          `استعراض ومناقشة سير العملية التعليمية ومؤشرات الأداء خلال الفترة الحالية`,
          `مناقشة نتائج التقويم والمستويات التحصيلية وخطط الدعم الإثرائي والعلاجي`,
          `توزيع المهام والمسؤوليات ومواءمة خطة العمل للأسبوع القادم`,
        ];

        const discussionPoints = [
          `تحليل فرص التحسين في الأداء التعليمي والانضباط المدرسي`,
          `آليات تفعيل الأنشطة والبرامج الداعمة لنواتج التعلم`,
          `معالجة التحديات الميدانية وتوفير المستلزمات التدريسية اللازمة`,
        ];

        const enhancedOutcomes = [
          `اعتماد خطة المتابعة التعليمية والبدء بتطبيقها بدءاً من مطلع الأسبوع`,
          `الالتزام بتوثيق الشواهد والتقارير الصفية واللاصفية في مواعيدها`,
          `تشكيل فرق المتابعة وتحديد مسؤولية التنفيذ لكل عضو من أعضاء الفريق`,
        ];

        const enhancedNotes = notes?.trim() || 'يُعقد اجتماع المتابعة الدوري القادم يوم الخميس لمراجعة نسب الإنجاز والتوصيات.';

        return NextResponse.json({
          success: true,
          reportType,
          enhanced: {
            steps: enhancedSteps,
            discussionPoints,
            outcomes: enhancedOutcomes,
            notes: enhancedNotes,
          },
        });
      }

      case 'results_analysis': {
        const enhancedObjectives = [
          `إتقان الطلاب للمفاهيم والمعارف الأساسية المقررة بنسب مقبولة`,
          `تميز ملحوظ في إجابات الأسئلة المباشرة والموضوعية`,
          `التزام الغالبية بزمن الاختبار والتعليمات المحددة`,
        ];

        const weaknesses = [
          `صعوبة التعامل مع أسئلة التفكير الناقد وحل المشكلات لدى بعض المتعلمين`,
          `فجوة في استيعاب بعض المهارات التراكمية والتطبيقية المعقدة`,
          `تفاوت مستويات الطلاب في سرعة استرجاع المهارات السابقة`,
        ];

        const enhancedSteps = [
          `إعداد حصص دعم علاجي وتدريبات موجهة للمهارات غير المتقنة`,
          `توفير أوراق عمل تشخيصية وعلاجية تركز على مواطن الضعف`,
          `إعادة قياس الأثر والتقويم التكويني المستمر للتحقق من زوال الفجوة`,
        ];

        const enhancedOutcomes = [
          `ارتفاع نسبة إتقان المهارات المستهدفة بعد تطبيق الخطة العلاجية إلى أكثر من 85%`,
          `تقلص الفجوة التعليمية وتحسن نتائج الطلاب في التقييمات اللاحقة`,
          `اكتساب الطلاب لثقة أعلى في التعامل مع الأسئلة المقالية والمهارية`,
        ];

        const enhancedNotes = notes?.trim() || `الاستمرار في المتابعة الفردية للطلاب المستهدفين، مع إشراك ولي الأمر في خطة الدعم المنزلي.`;

        return NextResponse.json({
          success: true,
          reportType,
          enhanced: {
            objectives: enhancedObjectives,
            weaknesses,
            steps: enhancedSteps,
            outcomes: enhancedOutcomes,
            notes: enhancedNotes,
          },
        });
      }

      case 'training_workshop': {
        const workshopName = safeTitle || 'الورشة التدريبية';
        const enhancedObjectives = [
          `إكساب المشاركين المعارف والمهارات التطبيقية الحديثة في مجالات ${workshopName}`,
          `تبادل الخبرات المهنية والممارسات المتميزة بين منسوبي المدرسة`,
          `تمكين المتدربين من توظيف الأدوات والأساليب المكتسبة في الميدان التعليمي`,
        ];

        const enhancedSteps = [
          `استعراض المفاهيم الأساسية والأطر النظرية المرتبطة بموضوع التدريب`,
          `تنفيذ أنشطة وورش عمل تفاعلية وتطبيقات عملية مشتركة`,
          `تحليل نماذج وتجارب واقعية ومناقشة سبل تعميمها في البيئة المدرسية`,
          `التقويم الختامي للورشة وقياس الرضا واستخلاص المخرجات`,
        ];

        const enhancedOutcomes = [
          `تمكن المشاركين من تطبيق المهارات المكتسبة في مهامهم اليومية بكفاءة`,
          `إنتاج وتصميم حقائب ونماذج تعليمية جاهزة للاستخدام الميداني`,
          `ارتفاع مؤشر رضا المتدربين عن المحتوى والتنظيم بمعدل ممتاز`,
        ];

        const enhancedNotes = notes?.trim() || 'توصية بتنظيم جلسات تطبيقية لمتابعة أثر التدريب في الممارسات اليومية.';

        return NextResponse.json({
          success: true,
          reportType,
          enhanced: {
            objectives: enhancedObjectives,
            steps: enhancedSteps,
            outcomes: enhancedOutcomes,
            notes: enhancedNotes,
          },
        });
      }

      case 'school_initiative': {
        const initiativeIdea = `مبادرة نوعية هادفة تهدف إلى تجويد البيئة التعليمية وتحسين نواتج التعلم من خلال استثمار الطاقات المدرسية وتفعيل الشراكة الإيجابية.`;

        const enhancedObjectives = [
          `تحقيق نقلة نوعية في دعم نواتج التعلم وتوفير بيئة تعليمية جاذبة`,
          `بناء وتطبيق نموذج مدرسي ريادي يتميز بالقابلية للاستدامة والتطوير`,
          `تحفيز روح الابتكار والمسؤولية المشتركة بين جميع منسوبي المدرسة`,
        ];

        const enhancedSteps = [
          `مرحلة التخطيط: إعداد وثيقة المبادرة وتحديد المستهدفات والمؤشرات الإجرائية`,
          `مرحلة التدشين: الإعلان عن المبادرة وتوزيع المهام على فرق العمل التنفيذية`,
          `مرحلة التطبيق: تنفيذ البرامج والفعاليات الميدانية وفق الخطة الزمنية المعتمدة`,
          `مرحلة التقويم: قياس الأثر المتحقق وتكريم المتميزين ورصد فرص التحسين`,
        ];

        const enhancedOutcomes = [
          `تحقيق مستهدفات المبادرة بنسب إنجاز قياسية انعكست إيجابياً على الطلاب`,
          `توثيق مخرجات ومنتجات متميزة تعكس تفاعل المجتمع المدرسي`,
          `تعزيز السمعة المؤسسية للمدرسة وبناء بيئة تعليمية محفزة`,
        ];

        const enhancedNotes = notes?.trim() || 'التوصية باعتماد استدامة المبادرة للفصول القادمة والتوسع في الفئات المستهدفة.';

        return NextResponse.json({
          success: true,
          reportType,
          enhanced: {
            initiativeIdea,
            objectives: enhancedObjectives,
            steps: enhancedSteps,
            outcomes: enhancedOutcomes,
            notes: enhancedNotes,
          },
        });
      }

      case 'occasion': {
        const occasionSignificance = `ترسيخ القيم الوطنية والتربوية والاحتفاء بهذه المناسبة العزيزة، وإبراز دور المدرسة في نشر الوعي وبناء الشخصية المتكاملة للمتعلم.`;

        const enhancedObjectives = [
          `نشر الوعي الثقافي والمعرفي بالقيم والرسائل المرتبطة بالمناسبة`,
          `إتاحة الفرصة للطلاب للتعبير عن مواهبهم ومشاركتهم الفعالة في الأنشطة`,
          `تعزيز روح الانتماء والمواطنة الصالحة لدى جميع منسوبي المدرسة`,
        ];

        const enhancedSteps = [
          `تخصيص الإذاعة المدرسية والحصص الصباحية للتعريف بأهمية المناسبة`,
          `تنظيم معارض فنية وعروض مرئية وندوات طلابية تفاعلية`,
          `إطلاق مسابقات ثقافية ومشاركات إبداعية متنوعة لجميع المراحل`,
          `تكريم المشاركين والمتميزين ونشر التغطية الإعلامية عبر القنوات المعتمدة`,
        ];

        const enhancedOutcomes = [
          `مشاركة واسعة وتفاعل حماسي من الطلاب وأولياء الأمور والكادر التعليمي`,
          `إنتاج أعمال ولوحات ورسومات طلابية ذات جودة عالية`,
          `تحقيق الأهداف التوعوية للمناسبة بنجاح وتميز`,
        ];

        const enhancedNotes = notes?.trim() || 'تفعيل ناجح ومتميز ساهم في إثراء البيئة المدرسية وترسيخ القيم المستهدفة.';

        return NextResponse.json({
          success: true,
          reportType,
          enhanced: {
            occasionSignificance,
            objectives: enhancedObjectives,
            steps: enhancedSteps,
            outcomes: enhancedOutcomes,
            notes: enhancedNotes,
          },
        });
      }

      case 'classroom_visit': {
        const enhancedObjectives = [
          `تبادل الخبرات التعليمية والاطلاع على الممارسات التدريسية المتميزة في الميدان`,
          `تعزيز التكامل المهني وتجويد آليات إدارة الصف واستثمار زمن الحصة`,
          `رصد فرص التحسين ونقل الخبرات الناجحة بين معلمي التخصص`,
        ];

        const observedPractices = [
          `التهيئة الحافزة الجاذبة وإثارة دافعية الطلاب نحو موضوع الدرس`,
          `التوظيف الفعال لاستراتيجيات التعلم النشط وتوزيع المهام بدقة`,
          `التنويع في أساليب التقويم التكويني المستمر وتقديم التغذية الراجعة الفورية`,
        ];

        const developmentNotes = [
          `التوسع في توظيف الأسئلة الصفية المفتوحة المحفزة للتفكير الناقد`,
          `استثمار المنصات والوسائط الرقمية في الأنشطة الفردية للطلاب`,
        ];

        const knowledgeTransfer = [
          `نقل الممارسات والأنشطة الصفية الناجحة للزملاء في الاجتماع الفني القادم`,
          `تكرار الزيارات التبادلية للاستفادة المشتركة من الأساليب التدريسية المبتكرة`,
        ];

        const enhancedNotes = notes?.trim() || 'زيارة صفية هادفة ومثمرة، وتكامل تربوي مميز بين المعلمين يخدم مصلحة الطلاب.';

        return NextResponse.json({
          success: true,
          reportType,
          enhanced: {
            objectives: enhancedObjectives,
            steps: observedPractices,
            outcomes: developmentNotes,
            notes: enhancedNotes,
            knowledgeTransferRecommendations: knowledgeTransfer,
          },
        });
      }

      case 'program_activity':
      default: {
        const progTitle = safeTitle || `${type || 'البرنامج'} المدرسي`;
        const enhancedObjectives = [
          `تنمية مهارات وقدرات الفئة المستهدفة في إطار ${progTitle}`,
          `تعزيز ممارسات التفاعل الإيجابي والمشاركة الفعالة في المجتمع المدرسي`,
          `دعم تحقيق نواتج التعلم المستهدفة وبناء خبرات وتطبيقات عملية ملموسة`,
        ];

        const enhancedSteps = [
          `تشكيل فريق العمل وإعداد الخطة الإجرائية والزمنية المعتمدة للتنفيذ`,
          `تهيئة الموارد والوسائل التعليمية والإعلان للفئة المستهدفة بوضوح`,
          `تنفيذ فعاليات ومراحل النشاط وفق الخطة الزمنية المعتمدة بدقة`,
          `تقويم الفعالية وتوثيق الشواهد والمخرجات التربوية المحققة`,
        ];

        const enhancedOutcomes = [
          `ارتفاع مستوى تفاعل ومشاركة المستفيدين بنسبة تتجاوز 90%`,
          `اكتساب الطلاب للمعارف والمهارات المستهدفة بصورة تطبيقية واضحة`,
          `تعزيز بيئة التعلم المحفزة وتوثيق المخرجات الإثرائية للبرنامج`,
        ];

        const enhancedNotes = notes?.trim() || 'استثمار مخرجات البرنامج في الأنشطة المدرسية المستمرة وتعزيز الاستدامة.';

        return NextResponse.json({
          success: true,
          reportType: 'program_activity',
          enhanced: {
            objectives: enhancedObjectives,
            steps: enhancedSteps,
            outcomes: enhancedOutcomes,
            notes: enhancedNotes,
          },
        });
      }
    }
  } catch (error) {
    console.error('AI enhance error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إعداد التقرير بالذكاء الاصطناعي' }, { status: 500 });
  }
}
