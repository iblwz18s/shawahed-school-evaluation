const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- بدء زراعة بيانات منصة شواهد التقويم المدرسي ---');

  // 1. مسح البيانات السابقة لضمان نظافة البيئة
  await prisma.auditLog.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.indicator.deleteMany({});
  await prisma.standard.deleteMany({});
  await prisma.domain.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.schoolSetting.deleteMany({});

  // 2. إعدادات المدرسة
  const setting = await prisma.schoolSetting.create({
    data: {
      schoolName: 'ثانوية رواد المعرفة',
      educationDepartment: 'الإدارة العامة للتعليم بمنطقة الرياض',
      academicYear: '1447-1448هـ / 2026م',
      schoolType: 'government',
      publicPortalEnabled: true,
    },
  });
  console.log('تم إنشاء إعدادات المدرسة:', setting.schoolName);

  // 3. المستخدمون (مدير ومعلم)
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashTeacher = await bcrypt.hash('teacher123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'فهيد دحام الشمري',
      email: 'admin@example.com',
      passwordHash: passwordHashAdmin,
      role: 'admin',
      isActive: true,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      name: 'أسامــه سليمـان البلوي',
      email: 'teacher@example.com',
      passwordHash: passwordHashTeacher,
      role: 'teacher',
      isActive: true,
    },
  });
  console.log('تم إنشاء المستخدمين: admin@example.com و teacher@example.com');

  // 4. المجالات والمعايير والمؤشرات
  const domainsData = [
    {
      code: '1',
      name: 'الإدارة المدرسية',
      description: 'يقيس هذا المجال كفاءة قيادة المدرسة والتخطيط الاستراتيجي والتشغيلي وتوفير المناخ التربوي الآمن والمجتمع المدرسي التشاركي.',
      sortOrder: 1,
      iconName: 'Building2',
      standards: [
        {
          code: '1.1',
          name: 'التخطيط',
          description: 'وضع ومتابعة الخطة التشغيلية للمدرسة وتحقيق مستهدفاتها التطويرية.',
          sortOrder: 1,
          indicators: [
            {
              code: '1-1-1-1',
              text: 'تضع المدرسة خطة تشغيلية شاملة وفق أهداف تطويرية محددة.',
              appliesToGovernment: true,
              appliesToPrivate: true,
              schoolGuidance: 'يرجى إرفاق رابط ملف الخطة التشغيلية المعتمد بصيغة PDF وتضمين جداول المتابعة والمؤشرات الزمنية.',
            },
            {
              code: '1-1-1-2',
              text: 'تتابع المدرسة تنفيذ خطتها التشغيلية، وتطورها بما يضمن تحقيق أهدافها.',
              appliesToGovernment: true,
              appliesToPrivate: true,
              schoolGuidance: 'شواهد تشمل تقارير المتابعة الدورية ونماذج مراجعة الأداء ومحاضر اجتماعات فريق التخطيط.',
            },
          ],
        },
        {
          code: '1.2',
          name: 'قيادة العملية التعليمية',
          description: 'تعزيز القيم والأخلاق والانضباط المدرسي ودعم رعاية الموهوبين وذوي الإعاقة.',
          sortOrder: 2,
          indicators: [
            {
              code: '1-2-1-1',
              text: 'تعزز المدرسة القيم الإسلامية، والهوية الوطنية.',
              appliesToGovernment: true,
              appliesToPrivate: true,
              schoolGuidance: 'خطة الأنشطة الوطنية، توثيق الاحتفاء بالأيام الوطنية والمناسبات الدينية والقيمية.',
            },
            {
              code: '1-2-1-2',
              text: 'تطبق المدرسة قيم مهنة التعليم وأخلاقياتها، وتتابع الالتزام بها.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '1-2-1-3',
              text: 'تطبق المدرسة إجراءات محددة؛ لدعم الانضباط المدرسي، وتتابع الالتزام بها.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '1-2-1-4',
              text: 'تنفذ المدرسة برامج وأنشطة تربوية داعمة للسلوك الإيجابي لدى المتعلمين، ومنهم ذوو الإعاقة والموهوبون، وتتابعها.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '1-2-1-5',
              text: 'تنفذ المدرسة برامج وأنشطة إثرائية؛ لتطوير مواهب المتعلمين، وتهيئهم للمستقبل، وتتابعها.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
        {
          code: '1.3',
          name: 'المجتمع المدرسي',
          description: 'بناء العلاقات الإيجابية وتعزيز مشاركة الأسرة والشراكة المجتمعية.',
          sortOrder: 3,
          indicators: [
            {
              code: '1-3-1-1',
              text: 'تعزز المدرسة بناء العلاقات الإيجابية والتعاون في المجتمع المدرسي.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '1-3-1-2',
              text: 'تعزز المدرسة مشاركة الأسرة في تعلم أبنائهم، والتحضير لمستقبلهم.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '1-3-1-3',
              text: 'تعزز المدرسة الشراكة المجتمعية؛ لدعم التعلم والتأثير الإيجابي في المجتمع.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
        {
          code: '1.4',
          name: 'التطوير المؤسسي',
          description: 'التطوير المهني والتقويم الذاتي والرخص المهنية والجاهزية المؤسسية.',
          sortOrder: 4,
          indicators: [
            {
              code: '1-4-1-1',
              text: 'توفر المدرسة كادرًا تعليميًا مكتملًا ومؤهلًا بما يتسق مع المهام الموكلة له.',
              appliesToGovernment: false,
              appliesToPrivate: true,
              schoolGuidance: 'خاص بالمدارس الأهلية والعالمية.',
            },
            {
              code: '1-4-1-2',
              text: 'توفر المدرسة كادرًا إداريًا مكتملًا ومؤهلًا بما يتسق مع المهام الموكلة له.',
              appliesToGovernment: false,
              appliesToPrivate: true,
              schoolGuidance: 'خاص بالمدارس الأهلية والعالمية.',
            },
            {
              code: '1-4-1-3',
              text: 'تظهر المدرسة الملاءة والاستدامة المالية.',
              appliesToGovernment: false,
              appliesToPrivate: true,
              schoolGuidance: 'خاص بالمدارس الأهلية والعالمية.',
            },
            {
              code: '1-4-1-4',
              text: 'تدعم المدرسة منسوبيها للحصول على الرخصة المهنية، وتتابعها.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '1-4-1-5',
              text: 'تدعم المدرسة التطوير المهني لمنسوبيها وفقًا لنتائج التقويم وتحليل احتياجاتهم.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '1-4-1-6',
              text: 'تطبق المدرسة التقويم الذاتي المبني على المعايير المعتمدة من الهيئة بشكل مستمر.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '1-4-1-7',
              text: 'تنفذ المدرسة خطة التحسين بناء على نتائج التقويم المدرسي، وتتابعها.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
        {
          code: '1.5',
          name: 'حقوق المتعلم وحمايته',
          description: 'حماية المتعلمين وضمان بيئة مدرسية آمنة نفسيًا واجتماعيًا.',
          sortOrder: 5,
          indicators: [
            {
              code: '1-5-1-1',
              text: 'تلتزم المدرسة بالمحافظة على حقوق المتعلمين، وحمايتهم.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '1-5-1-2',
              text: 'توفر المدرسة مناخًا آمنًا للتعلم والنمو نفسيًا واجتماعيًا.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
      ],
    },
    {
      code: '2',
      name: 'التعليم والتعلم',
      description: 'يركز على طرائق التدريس وتفعيل التقنيات وتطوير المهارات الأساسية وأساليب التقويم الصفي.',
      sortOrder: 2,
      iconName: 'GraduationCap',
      standards: [
        {
          code: '2.1',
          name: 'بناء خبرات التعلم',
          description: 'تنوع استراتيجيات التدريس وتنمية المهارات القرائية والعددية والتفكير الابتكاري.',
          sortOrder: 1,
          indicators: [
            {
              code: '2-1-1-1',
              text: 'توفر المدرسة فرصًا متكافئة للتعلم تلبي احتياجات المتعلمين، ومنهم ذوو الإعاقة والموهوبون.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-1-1-2',
              text: 'تدعم المدرسة تنفيذ المناهج بما يحقق نواتج التعلم المستهدفة.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-1-1-3',
              text: 'تنوع المدرسة في إستراتيجيات التعليم والتعلم؛ لتلبية احتياجات المتعلمين، ودعم تعلمهم.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-1-1-4',
              text: 'تفعل المدرسة التقنية الرقمية؛ لدعم تعلم المتعلمين وتلبية احتياجاتهم.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-1-1-5',
              text: 'تنفذ المدرسة أنشطة تعلم تطبيقية ترتبط بحياة المتعلمين.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-1-1-6',
              text: 'تنمي المدرسة المهارات القرائية والعددية الأساسية لدى المتعلمين.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-1-1-7',
              text: 'تنمي المدرسة مهارات التفكير والبحث والابتكار لدى المتعلمين.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-1-1-8',
              text: 'تنمي المدرسة المهارات العاطفية والاجتماعية لدى المتعلمين.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-1-1-9',
              text: 'تعزز المدرسة دافعية المتعلمين للتعلم، والاستمتاع به.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
        {
          code: '2.2',
          name: 'تقويم التعلم',
          description: 'تطبيق أدوات تقويم متنوعة وتحليل النتائج وتقديم التغذية الراجعة الفعالة.',
          sortOrder: 2,
          indicators: [
            {
              code: '2-2-1-1',
              text: 'تطبق المدرسة أساليب وأدوات تقويم متنوعة؛ للكشف عن مستويات أداء المتعلمين المختلفة.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-2-1-2',
              text: 'تطبق المدرسة أساليب وأدوات متنوعة؛ لتقويم نواتج التعلم المستهدفة في مناهج التعليم.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-2-1-3',
              text: 'تحلل المدرسة نتائج التقويم، وتوظفها في تحسين عمليات التعليم والتعلم والتقويم.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '2-2-1-4',
              text: 'تقدم المدرسة التغذية الراجعة للمتعلمين وأولياء أمورهم، وتتابع تقدمهم بشكل مستمر.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
      ],
    },
    {
      code: '3',
      name: 'نواتج التعلم',
      description: 'مستويات التحصيل العلمي في الاختبارات الوطنية، والتطور الشخصي والاجتماعي والصحي للطلاب.',
      sortOrder: 3,
      iconName: 'Award',
      standards: [
        {
          code: '3.1',
          name: 'التحصيل التعليمي',
          description: 'نتائج الاختبارات الوطنية في القراءة والرياضيات والعلوم وتقدم مستويات الطلاب.',
          sortOrder: 1,
          indicators: [
            {
              code: '3-1-1-1',
              text: 'يحقق المتعلمون نتائج مرتفعة في مجال القراءة وفقًا للاختبارات الوطنية.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-1-1-2',
              text: 'يحقق المتعلمون نتائج مرتفعة في مجال الرياضيات وفقًا للاختبارات الوطنية.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-1-1-3',
              text: 'يحقق المتعلمون نتائج مرتفعة في مجال العلوم وفقًا للاختبارات الوطنية.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-1-1-4',
              text: 'يحقق المتعلمون تقدمًا في مجال القراءة قياسًا على مستوى أداء المدرسة السابق في الاختبارات الوطنية.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-1-1-5',
              text: 'يحقق المتعلمون تقدمًا في مجال الرياضيات قياسًا على مستوى أداء المدرسة السابق في الاختبارات الوطنية.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-1-1-6',
              text: 'يحقق المتعلمون تقدمًا في مجال العلوم قياسًا على مستوى أداء المدرسة السابق في الاختبارات الوطنية.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
        {
          code: '3.2',
          name: 'التطور الشخصي والصحي والاجتماعي',
          description: 'قيم المواطنة والممارسات الصحية والعمل التطوعي والانضباط والتعلم الذاتي.',
          sortOrder: 2,
          indicators: [
            {
              code: '3-2-1-1',
              text: 'يظهر المتعلمون الاعتزاز بالقيم والهوية الوطنية.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-2-1-2',
              text: 'يظهر المتعلمون اتجاهات إيجابية نحو ذواتهم والآخرين.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-2-1-3',
              text: 'يظهر المتعلمون التزامًا بالممارسات الصحية السليمة.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-2-1-4',
              text: 'يشارك المتعلمون في الأنشطة المجتمعية والأعمال التطوعية.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-2-1-5',
              text: 'يلتزم المتعلمون بقواعد السلوك والانضباط المدرسي.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-2-1-6',
              text: 'يظهر المتعلمون الاستقلالية والقدرة على التعلم الذاتي.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '3-2-1-7',
              text: 'يظهر المتعلمون اعتزازًا بثقافتهم واحترامًا للتنوع الثقافي في المجتمع.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
      ],
    },
    {
      code: '4',
      name: 'البيئة المدرسية',
      description: 'ملاءمة المبنى المدرسي والتجهيزات والمرافق ومعايير الأمن والسلامة والصيانة المستمرة.',
      sortOrder: 4,
      iconName: 'ShieldCheck',
      standards: [
        {
          code: '4.1',
          name: 'المبنى المدرسي',
          description: 'استيفاء المواصفات والمساحات وتجهيز الفصول والمعامل والمرافق المساندة.',
          sortOrder: 1,
          indicators: [
            {
              code: '4-1-1-1',
              text: 'توفر المدرسة مبنى تعليميًا يستوفي المواصفات والاشتراطات المعتمدة من حيث النوع والخدمات المساندة.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '4-1-1-2',
              text: 'تنظيم مبنى المدرسة ملائم لعدد المتعلمين وخصائص المرحلة العمرية، ومنهم ذوو الإعاقة.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '4-1-1-3',
              text: 'تتوافر فصول ومعامل ملائمة للعملية التعليمية تلبي احتياجات المتعلمين، ومنهم ذوو الإعاقة.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '4-1-1-4',
              text: 'تلبي المرافق والتجهيزات والخدمات المساندة احتياجات المتعلمين، ومنهم ذوو الإعاقة.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
        {
          code: '4.2',
          name: 'الأمن والسلامة',
          description: 'جاهزية وسائل السلامة وخطط الإخلاء والمتابعة الدورية للنظافة والصيانة.',
          sortOrder: 2,
          indicators: [
            {
              code: '4-2-1-1',
              text: 'تتوافر في مبنى المدرسة ومرافقها جميع متطلبات الأمن والسلامة.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '4-2-1-2',
              text: 'تتابع المدرسة صيانة المبنى، وجميع مرافقه وتجهيزاته بشكل دوري.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
            {
              code: '4-2-1-3',
              text: 'تتابع المدرسة نظافة المبنى المدرسي، وجميع مرافقه بشكل مستمر.',
              appliesToGovernment: true,
              appliesToPrivate: true,
            },
          ],
        },
      ],
    },
  ];

  let totalIndicators = 0;
  let firstIndicator = null;
  let secondIndicator = null;
  let thirdIndicator = null;

  for (const d of domainsData) {
    const domain = await prisma.domain.create({
      data: {
        code: d.code,
        name: d.name,
        description: d.description,
        sortOrder: d.sortOrder,
        iconName: d.iconName,
      },
    });

    for (const s of d.standards) {
      const standard = await prisma.standard.create({
        data: {
          domainId: domain.id,
          code: s.code,
          name: s.name,
          description: s.description,
          sortOrder: s.sortOrder,
        },
      });

      for (let i = 0; i < s.indicators.length; i++) {
        const ind = s.indicators[i];
        const createdInd = await prisma.indicator.create({
          data: {
            standardId: standard.id,
            code: ind.code,
            text: ind.text,
            appliesToGovernment: ind.appliesToGovernment,
            appliesToPrivate: ind.appliesToPrivate,
            schoolGuidance: ind.schoolGuidance || null,
            sortOrder: i + 1,
            isActive: true,
          },
        });

        if (!firstIndicator && ind.code === '1-1-1-1') firstIndicator = createdInd;
        if (!secondIndicator && ind.code === '1-1-1-2') secondIndicator = createdInd;
        if (!thirdIndicator && ind.code === '1-2-1-1') thirdIndicator = createdInd;

        totalIndicators++;
      }
    }
  }

  console.log(`تم بنجاح زراعة ${domainsData.length} مجالات و 11 معياراً و ${totalIndicators} مؤشراً.`);

  // 5. إضافة الشواهد التجريبية المطلوبة في الوثيقة
  // - شاهد معتمد
  // - شاهد قيد المراجعة
  // - شاهد مرفوض
  if (firstIndicator) {
    const approvedEvidence = await prisma.evidence.create({
      data: {
        indicatorId: firstIndicator.id,
        title: 'الخطة التشغيلية السنوية المعتمدة 1447-1448هـ',
        url: 'https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/view?usp=sharing',
        description: 'نسخة رقمية معتمدة من خطة المدرسة التشغيلية متضمنة المستهدفات ومصفوفة البرامج التنفيذية.',
        academicYear: '1447-1448هـ / 2026م',
        semester: 'الفصل الدراسي الأول',
        submittedById: teacher.id,
        status: 'approved',
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        userName: admin.name,
        action: 'APPROVE_EVIDENCE',
        entityType: 'evidence',
        entityId: approvedEvidence.id,
        metadata: JSON.stringify({ title: approvedEvidence.title, indicatorCode: firstIndicator.code }),
      },
    });
  }

  if (secondIndicator) {
    const pendingEvidence = await prisma.evidence.create({
      data: {
        indicatorId: secondIndicator.id,
        title: 'تقرير المتابعة النصف فصلي للخطة التشغيلية',
        url: 'https://drive.google.com/drive/folders/1zYxWvUtSrQpOnMlKjIhGfEdCbA',
        description: 'مجلد يحتوي على تقارير لجان متابعة مؤشرات الأداء التشغيلي للفصل الأول.',
        academicYear: '1447-1448هـ / 2026م',
        semester: 'الفصل الدراسي الأول',
        submittedById: teacher.id,
        status: 'pending',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: teacher.id,
        userName: teacher.name,
        action: 'SUBMIT_EVIDENCE',
        entityType: 'evidence',
        entityId: pendingEvidence.id,
        metadata: JSON.stringify({ title: pendingEvidence.title, indicatorCode: secondIndicator.code }),
      },
    });
  }

  if (thirdIndicator) {
    const rejectedEvidence = await prisma.evidence.create({
      data: {
        indicatorId: thirdIndicator.id,
        title: 'تقرير مسابقة اليوم الوطني الـ 96',
        url: 'https://drive.google.com/file/d/sample-national-day-report',
        description: 'صور وتوثيق فعاليات تعزيز الانتماء الوطني والاحتفاء باليوم الوطني.',
        academicYear: '1447-1448هـ / 2026م',
        semester: 'الفصل الدراسي الأول',
        submittedById: teacher.id,
        status: 'rejected',
        rejectionReason: 'الرابط يتطلب إذن وصول (Access Denied)، يرجى تعديل الصلاحية إلى (كل من لديه الرابط يمكنه العرض) وإعادة الرفع.',
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        userName: admin.name,
        action: 'REJECT_EVIDENCE',
        entityType: 'evidence',
        entityId: rejectedEvidence.id,
        metadata: JSON.stringify({
          title: rejectedEvidence.title,
          indicatorCode: thirdIndicator.code,
          reason: rejectedEvidence.rejectionReason,
        }),
      },
    });
  }

  console.log('تم إنشاء الشواهد وسجلات التدقيق التجريبية بنجاح.');
  console.log('--- اكتملت عملية التهيئة بنجاح ---');
}

main()
  .catch((e) => {
    console.error('خطأ في إعداد البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
