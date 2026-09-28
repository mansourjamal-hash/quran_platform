export type Role = 'manager' | 'supervisor' | 'student';
export type PageState = 'not_memorized' | 'needs_review' | 'stable';
export type PlanType = 'memorization' | 'revision';
export type DelayPolicy = 'shift_remaining' | 'compress_next_week' | 'manual';
export type ScheduleAdjustmentMode = 'shift_remaining' | 'compress_next_week' | 'manual';

export interface Center {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  centerId: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  active: boolean;
  avatar?: string;
  supervisorId?: string;
  level?: string;
  enrollmentDate?: string;
}

export interface QuranPage {
  page: number;
  surahs: { number: number; name: string; startsHere: boolean }[];
}

export interface StudentProgram {
  studentId: string;
  centerId: string;
  pageStates: Record<number, PageState>;
  active: boolean;
  defaultMemorizationPages: number;
  defaultRevisionPages: number;
  reviewEvaluationPages: number;
  supervisorCanEditPlans: boolean;
  supervisorCanAdjustSchedule: boolean;
  delayPolicy: DelayPolicy;
  reviewCycleDays: number;
  commitmentWeight: number;
  commitmentTargetPercent: number;
}

export interface ReviewRecord {
  id: string;
  centerId: string;
  studentId: string;
  periodStart: string;
  periodEnd: string;
  evaluatedPages: number;
  reviewStrength: number;
  score: number;
  notes?: string;
  createdAt: string;
}

export interface PlanRecord {
  id: string;
  centerId: string;
  studentId: string;
  date: string;
  type: PlanType;
  surah: string;
  ayahFrom: number;
  ayahTo: number;
  pageFrom: number;
  pageTo: number;
  requiredAmount: number;
  actualAmount: number;
  evaluationPages: number;
  status: 'pending' | 'completed' | 'delayed' | 'failed';
  notes?: string;
  evaluation?: Evaluation;
  evaluations?: PageEvaluation[];
  scheduleNote?: string;
}

export interface Evaluation {
  memorizationScore: number;
  fluencyScore: number;
  correctionScore: number;
  totalScore: number;
  passed: boolean;
  notes?: string;
  attempts: number;
  date: string;
  reviewStrength?: number;
}

export interface PageEvaluation {
  page: number;
  memorizationScore: number;
  fluencyScore: number;
  correctionScore: number;
  totalScore: number;
  passed: boolean;
  notes?: string;
  attempts: number;
  date: string;
  reviewStrength?: number;
}

export interface AuditLog {
  id: string;
  centerId: string;
  actorUserId: string;
  action: string;
  targetUserId?: string;
  details?: string;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  centers: Center[];
  plans: PlanRecord[];
  programs: StudentProgram[];
  auditLogs: AuditLog[];
  reviews: ReviewRecord[];
  activeRole: Role;
}
