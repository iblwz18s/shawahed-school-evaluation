export type UserRole = 'admin' | 'teacher';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export type EvidenceStatus = 'pending' | 'approved' | 'rejected';

export interface DomainItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  iconName: string | null;
  standardsCount?: number;
  indicatorsCount?: number;
  approvedCount?: number;
}

export interface StandardItem {
  id: string;
  domainId: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  indicatorsCount?: number;
  approvedCount?: number;
}

export interface IndicatorItem {
  id: string;
  standardId: string;
  code: string;
  text: string;
  appliesToGovernment: boolean;
  appliesToPrivate: boolean;
  schoolGuidance: string | null;
  sortOrder: number;
  isActive: boolean;
  standard?: {
    code: string;
    name: string;
    domain?: {
      id?: string;
      code: string;
      name: string;
    };
  };
  evidences?: EvidenceItem[];
  approvedEvidencesCount?: number;
}

export type EvidenceType = 'external_link' | 'report';
export type EvidenceSubType = 'video' | 'file' | 'folder' | 'presentation' | 'other' | 'program_activity';

export type ReportType =
  | 'program_activity'
  | 'teaching_strategy'
  | 'school_initiative'
  | 'training_workshop'
  | 'meeting'
  | 'occasion'
  | 'classroom_visit'
  | 'results_analysis';

export interface ReportData {
  title: string;
  type?: 'برنامج' | 'نشاط' | string;
  reportType?: ReportType;
  executor: string;
  date: string;
  audience?: string;
  beneficiariesCount?: string;

  // استراتيجية تدريس
  subject?: string;
  gradeLevel?: string;
  tools?: string[];

  // مبادرة مدرسية
  initiativeIdea?: string;
  executionStages?: string[];
  sustainabilityRecommendations?: string;

  // دورة تدريبية / ورشة عمل
  trainer?: string;
  trainingTime?: string;
  trainingTopics?: string[];

  // اجتماع / لقاء
  meetingChair?: string;
  meetingTime?: string;
  meetingAttendees?: string;
  meetingTopics?: string[];
  discussionPoints?: string[];
  decisionsAndRecommendations?: string[];
  nextMeetingDate?: string;

  // يوم عالمي / مناسبة
  occasionSignificance?: string;
  executedActivities?: string[];
  studentInteraction?: string;
  closingRemark?: string;

  // زيارة صفية / زيارة تبادلية
  visitingTeacher?: string;
  visitedTeacher?: string;
  visitPeriod?: string;
  lessonTopic?: string;
  observedPractices?: string[];
  developmentNotes?: string[];
  knowledgeTransferRecommendations?: string[];

  // تحليل نتائج / خطة علاجية
  subjectOrTest?: string;
  termSemester?: string;
  testedStudentsCount?: string;
  strengths?: string[];
  weaknesses?: string[];
  remedialPlan?: string[];
  improvementIndicators?: string[];

  // الحقول العامة الموحدة
  objectives?: string[];
  steps?: string[];
  outcomes?: string[];
  images: Array<{
    url: string;
    caption?: string;
  }>;
  notes?: string;
}

export interface EvidenceItem {
  id: string;
  indicatorId: string;
  title: string;
  evidenceType: EvidenceType;
  subType?: EvidenceSubType | string | null;
  url?: string | null;
  reportData?: string | null;
  pdfUrl?: string | null;
  description: string | null;
  academicYear: string;
  semester: string | null;
  submittedById: string;
  status: EvidenceStatus;
  rejectionReason: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  submittedBy?: {
    id: string;
    name: string;
    email: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
  indicator?: {
    id: string;
    code: string;
    text: string;
    standard?: {
      code: string;
      name: string;
      domain?: {
        id?: string;
        code: string;
        name: string;
      };
    };
  };
}

export interface AuditLogItem {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: string | null;
  createdAt: string;
}

export interface SchoolSettingItem {
  id: string;
  schoolName: string;
  educationDepartment: string;
  schoolLogoUrl: string | null;
  ministryLogoUrl: string | null;
  academicYear: string;
  schoolType: string;
  publicPortalEnabled: boolean;
}
