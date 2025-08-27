import {
  users,
  resumes,
  jobDescriptions,
  resumeVersions,
  coverLetters,
  interviewQuestions,
  type User,
  type UpsertUser,
  type Resume,
  type InsertResume,
  type JobDescription,
  type InsertJobDescription,
  type ResumeVersion,
  type InsertResumeVersion,
  type CoverLetter,
  type InsertCoverLetter,
  type InterviewQuestion,
  type InsertInterviewQuestion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getResumesByUserId(userId: string): Promise<Resume[]>;
  getResumeById(id: string): Promise<Resume | undefined>;
  deleteResume(id: string): Promise<void>;
  
  // Job description operations
  createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription>;
  getJobDescriptionsByUserId(userId: string): Promise<JobDescription[]>;
  getJobDescriptionById(id: string): Promise<JobDescription | undefined>;
  
  // Resume version operations
  createResumeVersion(version: InsertResumeVersion): Promise<ResumeVersion>;
  getResumeVersionsByResumeId(resumeId: string): Promise<ResumeVersion[]>;
  getResumeVersionsByUserId(userId: string): Promise<ResumeVersion[]>;
  getResumeVersionById(id: string): Promise<ResumeVersion | undefined>;
  updateResumeVersion(id: string, updates: Partial<ResumeVersion>): Promise<ResumeVersion>;
  deleteResumeVersion(id: string): Promise<void>;
  
  // Cover letter operations
  createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter>;
  getCoverLettersByVersionId(resumeVersionId: string): Promise<CoverLetter[]>;
  getCoverLettersByUserId(userId: string): Promise<CoverLetter[]>;
  
  // Interview question operations
  createInterviewQuestions(questions: InsertInterviewQuestion[]): Promise<InterviewQuestion[]>;
  getInterviewQuestionsByVersionId(resumeVersionId: string): Promise<InterviewQuestion[]>;
  getInterviewQuestionsByUserId(userId: string): Promise<InterviewQuestion[]>;
  
  // Statistics
  getUserStats(userId: string): Promise<{
    totalResumes: number;
    totalVersions: number;
    averageAtsScore: number;
    totalApplications: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Resume operations
  async createResume(resume: InsertResume): Promise<Resume> {
    const [newResume] = await db.insert(resumes).values(resume).returning();
    return newResume;
  }

  async getResumesByUserId(userId: string): Promise<Resume[]> {
    return await db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.createdAt));
  }

  async getResumeById(id: string): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async deleteResume(id: string): Promise<void> {
    await db.delete(resumes).where(eq(resumes.id, id));
  }

  // Job description operations
  async createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription> {
    const [newJobDescription] = await db.insert(jobDescriptions).values(jobDescription).returning();
    return newJobDescription;
  }

  async getJobDescriptionsByUserId(userId: string): Promise<JobDescription[]> {
    return await db.select().from(jobDescriptions).where(eq(jobDescriptions.userId, userId)).orderBy(desc(jobDescriptions.createdAt));
  }

  async getJobDescriptionById(id: string): Promise<JobDescription | undefined> {
    const [jobDescription] = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, id));
    return jobDescription;
  }

  // Resume version operations
  async createResumeVersion(version: InsertResumeVersion): Promise<ResumeVersion> {
    const [newVersion] = await db.insert(resumeVersions).values(version).returning();
    return newVersion;
  }

  async getResumeVersionsByResumeId(resumeId: string): Promise<ResumeVersion[]> {
    return await db.select().from(resumeVersions).where(eq(resumeVersions.resumeId, resumeId)).orderBy(desc(resumeVersions.createdAt));
  }

  async getResumeVersionsByUserId(userId: string): Promise<ResumeVersion[]> {
    return await db
      .select({
        id: resumeVersions.id,
        resumeId: resumeVersions.resumeId,
        jobDescriptionId: resumeVersions.jobDescriptionId,
        versionName: resumeVersions.versionName,
        tailoredContent: resumeVersions.tailoredContent,
        atsScore: resumeVersions.atsScore,
        keywordMatches: resumeVersions.keywordMatches,
        improvements: resumeVersions.improvements,
        isActive: resumeVersions.isActive,
        createdAt: resumeVersions.createdAt,
      })
      .from(resumeVersions)
      .innerJoin(resumes, eq(resumeVersions.resumeId, resumes.id))
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumeVersions.createdAt));
  }

  async getResumeVersionById(id: string): Promise<ResumeVersion | undefined> {
    const [version] = await db.select().from(resumeVersions).where(eq(resumeVersions.id, id));
    return version;
  }

  async updateResumeVersion(id: string, updates: Partial<ResumeVersion>): Promise<ResumeVersion> {
    const [updatedVersion] = await db
      .update(resumeVersions)
      .set(updates)
      .where(eq(resumeVersions.id, id))
      .returning();
    return updatedVersion;
  }

  async deleteResumeVersion(id: string): Promise<void> {
    await db.delete(resumeVersions).where(eq(resumeVersions.id, id));
  }

  // Cover letter operations
  async createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter> {
    const [newCoverLetter] = await db.insert(coverLetters).values(coverLetter).returning();
    return newCoverLetter;
  }

  async getCoverLettersByVersionId(resumeVersionId: string): Promise<CoverLetter[]> {
    return await db.select().from(coverLetters).where(eq(coverLetters.resumeVersionId, resumeVersionId)).orderBy(desc(coverLetters.createdAt));
  }

  async getCoverLettersByUserId(userId: string): Promise<CoverLetter[]> {
    // Get cover letters by joining with resume versions to find user's cover letters
    const userResumeVersions = await db.select().from(resumeVersions)
      .innerJoin(resumes, eq(resumeVersions.resumeId, resumes.id))
      .where(eq(resumes.userId, userId));
    
    const versionIds = userResumeVersions.map(v => v.resume_versions.id);
    
    if (versionIds.length === 0) {
      return [];
    }
    
    return await db.select().from(coverLetters)
      .where(inArray(coverLetters.resumeVersionId, versionIds))
      .orderBy(desc(coverLetters.createdAt));
  }

  // Interview question operations
  async createInterviewQuestions(questions: InsertInterviewQuestion[]): Promise<InterviewQuestion[]> {
    if (questions.length === 0) return [];
    return await db.insert(interviewQuestions).values(questions).returning();
  }

  async getInterviewQuestionsByVersionId(resumeVersionId: string): Promise<InterviewQuestion[]> {
    return await db.select().from(interviewQuestions).where(eq(interviewQuestions.resumeVersionId, resumeVersionId)).orderBy(desc(interviewQuestions.createdAt));
  }

  async getInterviewQuestionsByUserId(userId: string): Promise<InterviewQuestion[]> {
    // Get interview questions by joining with resume versions to find user's questions
    const userResumeVersions = await db.select().from(resumeVersions)
      .innerJoin(resumes, eq(resumeVersions.resumeId, resumes.id))
      .where(eq(resumes.userId, userId));
    
    const versionIds = userResumeVersions.map(v => v.resume_versions.id);
    
    if (versionIds.length === 0) {
      return [];
    }
    
    return await db.select().from(interviewQuestions)
      .where(inArray(interviewQuestions.resumeVersionId, versionIds))
      .orderBy(desc(interviewQuestions.createdAt));
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    totalResumes: number;
    totalVersions: number;
    averageAtsScore: number;
    totalApplications: number;
  }> {
    const userResumes = await this.getResumesByUserId(userId);
    const userVersions = await this.getResumeVersionsByUserId(userId);
    
    const averageAtsScore = userVersions.length > 0 
      ? userVersions.reduce((acc, version) => acc + (parseFloat(version.atsScore || '0')), 0) / userVersions.length
      : 0;

    return {
      totalResumes: userResumes.length,
      totalVersions: userVersions.length,
      averageAtsScore: Math.round(averageAtsScore),
      totalApplications: userVersions.length, // Assuming each version represents an application
    };
  }
}

export const storage = new DatabaseStorage();
