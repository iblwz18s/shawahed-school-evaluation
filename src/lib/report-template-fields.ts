import { ReportType } from '@/types';
import { toMasculine, toMasculineLines } from '@/lib/arabic-masculine';

/**
 * يحوّل حقول القوالب المنقولة من الموقع المصدر (Fields[...]) إلى حقول نموذج
 * التقرير في المنصة، مع الحفاظ على بقية الحقول في جدول «معلومات إضافية».
 *
 * ملف البيانات نفسه (src/data/report-templates-content.json) كبير ويُقرأ على
 * السيرفر فقط، أما هذا الملف فيعمل في أي مكان.
 */

/** التسميات العربية لحقول المصدر. */
export const SOURCE_FIELD_LABELS: Record<string, string> = {
  Activities: 'الأنشطة المنفذة',
  ActivityType: 'نوع النشاط',
  Beneficiaries: 'المستفيدون',
  Class: 'الفصل / الصف',
  ContactNumber: 'رقم التواصل',
  Description: 'وصف التقرير',
  Duration: 'المدة',
  EducationalMeans: 'الوسائل التعليمية',
  Effectiveness: 'مدى الفاعلية',
  EmailAddress: 'البريد الإلكتروني',
  ExecutionDate: 'تاريخ التنفيذ',
  ExecutionDuration: 'مدة التنفيذ',
  ExecutionTime: 'وقت التنفيذ',
  ExpectedOutcomes: 'المخرجات المتوقعة',
  Grade: 'الصف الدراسي',
  Impact: 'الأثر المتحقق',
  ImplementationApproach: 'أسلوب التنفيذ',
  ImplementationDomains: 'مجالات التنفيذ',
  ImplementationSteps: 'خطوات التنفيذ',
  InitiativeComponents: 'مكونات المبادرة (آلية التنفيذ)',
  InitiativeDescription: 'وصف المبادرة',
  InitiativeIdea: 'فكرة المبادرة (الهدف العام)',
  InitiativeLocation: 'مكان المبادرة',
  InitiativeName: 'اسم المبادرة',
  InitiativeOwnerName: 'صاحب المبادرة',
  InitiativeSlogan: 'شعار المبادرة',
  InitiativeTheme: 'محور المبادرة',
  InitiativeType: 'نوع المبادرة',
  Introduction: 'المقدمة',
  Justifications: 'المبررات',
  LessonTitle: 'عنوان الدرس',
  Location: 'المكان',
  MadrasatiPlatform: 'منصة مدرستي (المقرر)',
  Notes: 'ملاحظات',
  Objectives: 'الأهداف',
  Outcomes: 'النتائج',
  ParentsCount: 'عدد أولياء الأمور',
  ParticipantsCount: 'عدد المشاركين',
  PartnershipNames: 'أسماء الشراكات',
  PartnershipsCount: 'عدد الشراكات',
  ProgramDescription: 'وصف البرنامج',
  ProgramImpact: 'أثر البرنامج',
  Recommendations: 'التوصيات',
  Results: 'النتائج',
  SessionsCount: 'عدد الجلسات / الحصص',
  Stage: 'المرحلة',
  Strategy: 'الاستراتيجية',
  StrategyType: 'نوع الاستراتيجية',
  StudentsCount: 'عدد الطلاب',
  StudentsWithDisabilityCount: 'عدد الطلاب ذوي الإعاقة',
  Subject: 'المادة',
  SuccessIndicators: 'مؤشرات النجاح',
  TargetGroup: 'الفئة المستهدفة',
  TargetGroupDetails: 'تفاصيل الفئة المستهدفة',
  ToolDescription: 'وصف الأداة',
  Type: 'النوع',
  UsageImpact: 'أثر الاستخدام',
};

/** حقول لا تُنقل: ترويسة الوثيقة وتوقيعاتها (للمنصة ترويسة وتوقيع خاصان). */
const SKIPPED_FIELDS = new Set([
  'HeaderInfo',
  'AdditionalInfo',
  'RightSignature',
  'CenterSignature',
  'LeftSignature',
  'ReportTitle',
  'ReportTitleEN',
  'InitiativeLocationEN',
]);

/** أول حقل متاح من كل قائمة يُستخدم للحقل المقصود. */
const SLOTS = {
  objectives: ['Objectives', 'Goals'],
  steps: ['Activities', 'ImplementationSteps', 'InitiativeComponents', 'ImplementationDomains', 'EducationalMeans'],
  outcomes: ['Results', 'Outcomes', 'Impact', 'ProgramImpact', 'UsageImpact', 'Effectiveness', 'ExpectedOutcomes', 'SuccessIndicators'],
  introduction: ['Introduction', 'InitiativeDescription', 'ProgramDescription', 'Description', 'Justifications'],
  recommendations: ['Recommendations', 'Notes'],
  initiativeIdea: ['InitiativeIdea', 'InitiativeTheme', 'InitiativeDescription'],
  subject: ['Subject'],
  gradeLevel: ['Grade', 'Stage', 'Class'],
  audience: ['TargetGroup', 'TargetGroupDetails', 'Class'],
  beneficiariesCount: ['StudentsCount', 'ParticipantsCount', 'ParentsCount', 'Beneficiaries'],
  title: ['ReportTitle', 'InitiativeName'],
  date: ['ExecutionDate'],
} as const;

/** ترتيب عرض الحقول الإضافية في التقرير. */
const EXTRA_ORDER = [
  'InitiativeSlogan',
  'InitiativeType',
  'InitiativeOwnerName',
  'ActivityType',
  'Strategy',
  'StrategyType',
  'ImplementationApproach',
  'LessonTitle',
  'Subject',
  'Stage',
  'Grade',
  'Class',
  'TargetGroup',
  'TargetGroupDetails',
  'EducationalMeans',
  'ToolDescription',
  'MadrasatiPlatform',
  'Location',
  'InitiativeLocation',
  'ExecutionTime',
  'ExecutionDuration',
  'Duration',
  'SessionsCount',
  'StudentsCount',
  'StudentsWithDisabilityCount',
  'ParticipantsCount',
  'ParentsCount',
  'PartnershipsCount',
  'PartnershipNames',
  'Beneficiaries',
  'ContactNumber',
  'EmailAddress',
  'Justifications',
  'SuccessIndicators',
  'Effectiveness',
  'ProgramImpact',
  'UsageImpact',
  'Impact',
  'ProgramDescription',
  'InitiativeDescription',
  'Description',
  'Type',
];

export interface TemplateExtraField {
  label: string;
  value: string;
}

export interface TemplatePrefill {
  title: string;
  date: string;
  audience: string;
  beneficiariesCount: string;
  subject: string;
  gradeLevel: string;
  initiativeIdea: string;
  occasionSignificance: string;
  objectives: string[];
  steps: string[];
  outcomes: string[];
  notes: string;
  extraFields: TemplateExtraField[];
}

/** تقسيم نصّ متعدد الأسطر إلى بنود نظيفة بلا أرقام أو نقاط في البداية. */
export function splitLines(value: string): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s*[•▪◦*\-\u2013\u2014]+\s*/, '')
        .replace(/^\s*[(\[]?\s*[0-9\u0660-\u0669]+\s*[)\].\-:]?\s*/, '')
        .trim()
    )
    .filter(Boolean);
}

function firstAvailable(fields: Record<string, string>, keys: readonly string[]): string {
  for (const key of keys) {
    const value = (fields[key] || '').trim();
    if (value) return value;
  }
  return '';
}

const LABELS_FOR_EXTRA = SOURCE_FIELD_LABELS;

export function buildTemplatePrefill(
  fields: Record<string, string>,
  reportType: ReportType
): TemplatePrefill {
  const used = new Set<string>();
  const take = (keys: readonly string[]): string => {
    const key = keys.find((k) => (fields[k] || '').trim());
    if (!key) return '';
    used.add(key);
    return fields[key].trim();
  };

  const title = take(SLOTS.title);
  const date = take(SLOTS.date);
  const introduction = take(SLOTS.introduction);
  const objectives = splitLines(take(SLOTS.objectives));
  const steps = splitLines(take(SLOTS.steps));
  const outcomes = splitLines(take(SLOTS.outcomes));
  const recommendations = take(SLOTS.recommendations);
  const initiativeIdea = take(SLOTS.initiativeIdea);
  const subject = take(SLOTS.subject);
  const gradeLevel = take(SLOTS.gradeLevel);
  const audience = take(SLOTS.audience);
  const beneficiariesCount = take(SLOTS.beneficiariesCount);

  // المقدمة تُعرض في «أهمية المناسبة» للتقارير المناسباتية، وبقية الأنواع
  // تُدرج في «المعلومات الإضافية» حتى لا يفقد المحتوى.
  const occasionSignificance =
    reportType === 'occasion' || reportType === 'school_initiative' ? introduction : '';

  const extras: TemplateExtraField[] = [];
  if (introduction && !occasionSignificance) {
    extras.push({ label: SOURCE_FIELD_LABELS.Introduction, value: introduction });
  }

  const keys = Object.keys(fields);
  const ordered = [
    ...EXTRA_ORDER.filter((k) => keys.includes(k)),
    ...keys.filter((k) => !EXTRA_ORDER.includes(k)),
  ];
  for (const key of ordered) {
    if (used.has(key) || SKIPPED_FIELDS.has(key)) continue;
    const value = (fields[key] || '').trim();
    if (!value) continue;
    extras.push({ label: LABELS_FOR_EXTRA[key] || key, value });
  }

  // كل النصوص تمرّ على محوّل الصيغة حتى تكون التقارير بصيغة الطلاب.
  return {
    title: toMasculine(title),
    date,
    audience: toMasculine(audience || 'جميع طلاب المدرسة'),
    beneficiariesCount: toMasculine(beneficiariesCount),
    subject: toMasculine(subject),
    gradeLevel: toMasculine(gradeLevel),
    initiativeIdea: toMasculine(initiativeIdea),
    occasionSignificance: toMasculine(occasionSignificance),
    objectives: toMasculineLines(objectives),
    steps: toMasculineLines(steps),
    outcomes: toMasculineLines(outcomes),
    notes: toMasculine(recommendations),
    extraFields: extras.map((field) => ({
      label: field.label,
      value: toMasculine(field.value),
    })),
  };
}
