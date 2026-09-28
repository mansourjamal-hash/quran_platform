import { pgTable, text, boolean, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const centersTable = pgTable('quran_centers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const usersTable = pgTable('quran_users', {
  id: text('id').primaryKey(),
  centerId: text('center_id').notNull(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  active: boolean('active').notNull().default(true),
  supervisorId: text('supervisor_id'),
  level: text('level'),
  enrollmentDate: text('enrollment_date'),
});

export const programsTable = pgTable('quran_programs', {
  studentId: text('student_id').primaryKey(),
  centerId: text('center_id').notNull(),
  pageStates: jsonb('page_states').notNull(),
  active: boolean('active').notNull().default(true),
  defaultMemorizationPages: integer('default_memorization_pages').notNull().default(1),
  defaultRevisionPages: integer('default_revision_pages').notNull().default(4),
  reviewEvaluationPages: integer('review_evaluation_pages').notNull().default(2),
  supervisorCanEditPlans: boolean('supervisor_can_edit_plans').notNull().default(true),
  supervisorCanAdjustSchedule: boolean('supervisor_can_adjust_schedule').notNull().default(true),
  delayPolicy: text('delay_policy').notNull().default('shift_remaining'),
  reviewCycleDays: integer('review_cycle_days').notNull().default(7),
  commitmentWeight: integer('commitment_weight').notNull().default(15),
});

export const plansTable = pgTable('quran_plans', {
  id: text('id').primaryKey(),
  centerId: text('center_id').notNull(),
  studentId: text('student_id').notNull(),
  date: text('date').notNull(),
  type: text('type').notNull(),
  surah: text('surah').notNull(),
  ayahFrom: integer('ayah_from').notNull(),
  ayahTo: integer('ayah_to').notNull(),
  pageFrom: integer('page_from').notNull(),
  pageTo: integer('page_to').notNull(),
  requiredAmount: integer('required_amount').notNull(),
  actualAmount: integer('actual_amount').notNull().default(0),
  evaluationPages: integer('evaluation_pages').notNull().default(1),
  status: text('status').notNull().default('pending'),
  notes: text('notes'),
  evaluation: jsonb('evaluation'),
  evaluations: jsonb('evaluations').notNull().default([]),
});

export const sessionsTable = pgTable('quran_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const auditLogsTable = pgTable('quran_audit_logs', {
  id: text('id').primaryKey(),
  centerId: text('center_id').notNull(),
  actorUserId: text('actor_user_id').notNull(),
  action: text('action').notNull(),
  targetUserId: text('target_user_id'),
  details: text('details'),
  createdAt: timestamp('created_at').notNull(),
});


export const reviewsTable = pgTable('quran_reviews', {
  id: text('id').primaryKey(),
  centerId: text('center_id').notNull(),
  studentId: text('student_id').notNull(),
  periodStart: text('period_start').notNull(),
  periodEnd: text('period_end').notNull(),
  evaluatedPages: integer('evaluated_pages').notNull(),
  reviewStrength: integer('review_strength').notNull(),
  score: integer('score').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull(),
});

export const insertCenterSchema=createInsertSchema(centersTable);
export const insertUserSchema=createInsertSchema(usersTable);
export const insertProgramSchema=createInsertSchema(programsTable);
export const insertPlanSchema=createInsertSchema(plansTable);
export const insertAuditLogSchema=createInsertSchema(auditLogsTable);
