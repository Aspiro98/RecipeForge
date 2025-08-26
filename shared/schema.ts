import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Resumes table
export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name").notNull(),
  originalContent: text("original_content").notNull(),
  parsedContent: jsonb("parsed_content").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, docx
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job descriptions table
export const jobDescriptions = pgTable("job_descriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  company: varchar("company"),
  description: text("description").notNull(),
  url: varchar("url"),
  extractedKeywords: jsonb("extracted_keywords").notNull().default('[]'),
  requiredSkills: jsonb("required_skills").notNull().default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resume versions table (tailored versions)
export const resumeVersions = pgTable("resume_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resumeId: varchar("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  jobDescriptionId: varchar("job_description_id").notNull().references(() => jobDescriptions.id, { onDelete: "cascade" }),
  versionName: varchar("version_name").notNull(),
  tailoredContent: text("tailored_content").notNull(),
  atsScore: decimal("ats_score", { precision: 5, scale: 2 }),
  keywordMatches: jsonb("keyword_matches").notNull().default('[]'),
  improvements: jsonb("improvements").notNull().default('[]'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cover letters table
export const coverLetters = pgTable("cover_letters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resumeVersionId: varchar("resume_version_id").notNull().references(() => resumeVersions.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  tone: varchar("tone").notNull().default('professional'), // professional, casual, enthusiastic
  createdAt: timestamp("created_at").defaultNow(),
});

// Interview questions table
export const interviewQuestions = pgTable("interview_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resumeVersionId: varchar("resume_version_id").notNull().references(() => resumeVersions.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  suggestedAnswer: text("suggested_answer").notNull(),
  category: varchar("category").notNull(), // behavioral, technical, situational
  difficulty: varchar("difficulty").notNull().default('medium'), // easy, medium, hard
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  jobDescriptions: many(jobDescriptions),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
  versions: many(resumeVersions),
}));

export const jobDescriptionsRelations = relations(jobDescriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [jobDescriptions.userId],
    references: [users.id],
  }),
  versions: many(resumeVersions),
}));

export const resumeVersionsRelations = relations(resumeVersions, ({ one, many }) => ({
  resume: one(resumes, {
    fields: [resumeVersions.resumeId],
    references: [resumes.id],
  }),
  jobDescription: one(jobDescriptions, {
    fields: [resumeVersions.jobDescriptionId],
    references: [jobDescriptions.id],
  }),
  coverLetters: many(coverLetters),
  interviewQuestions: many(interviewQuestions),
}));

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
  resumeVersion: one(resumeVersions, {
    fields: [coverLetters.resumeVersionId],
    references: [resumeVersions.id],
  }),
}));

export const interviewQuestionsRelations = relations(interviewQuestions, ({ one }) => ({
  resumeVersion: one(resumeVersions, {
    fields: [interviewQuestions.resumeVersionId],
    references: [resumeVersions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobDescriptionSchema = createInsertSchema(jobDescriptions).omit({
  id: true,
  createdAt: true,
}).extend({
  description: z.string().min(50, "Job description must be at least 50 characters"),
});

export const insertResumeVersionSchema = createInsertSchema(resumeVersions).omit({
  id: true,
  createdAt: true,
});

export const insertCoverLetterSchema = createInsertSchema(coverLetters).omit({
  id: true,
  createdAt: true,
});

export const insertInterviewQuestionSchema = createInsertSchema(interviewQuestions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = z.infer<typeof insertJobDescriptionSchema>;
export type ResumeVersion = typeof resumeVersions.$inferSelect;
export type InsertResumeVersion = z.infer<typeof insertResumeVersionSchema>;
export type CoverLetter = typeof coverLetters.$inferSelect;
export type InsertCoverLetter = z.infer<typeof insertCoverLetterSchema>;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestion = z.infer<typeof insertInterviewQuestionSchema>;
