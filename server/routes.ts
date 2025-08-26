import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { groqService } from "./services/openai";
import { fileProcessor, upload } from "./services/fileProcessor";
import {
  insertResumeSchema,
  insertJobDescriptionSchema,
  insertResumeVersionSchema,
  insertCoverLetterSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Resume routes
  app.post('/api/resumes/upload', isAuthenticated, upload.single('resume'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const parsedResume = await fileProcessor.parseResumeFile(
        file.path,
        file.originalname,
        file.mimetype === 'application/pdf' ? 'pdf' : 'docx'
      );

      // Ensure content is properly sanitized for database storage
      const sanitizedContent = parsedResume.content.replace(/\x00/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
      
      const resumeData = insertResumeSchema.parse({
        userId,
        fileName: file.originalname,
        originalContent: sanitizedContent,
        parsedContent: parsedResume.metadata,
        fileType: parsedResume.metadata.fileType,
        fileSize: file.size,
      });

      const resume = await storage.createResume(resumeData);
      res.json(resume);
    } catch (error) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ message: "Failed to upload resume" });
    }
  });

  app.get('/api/resumes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resumes = await storage.getResumesByUserId(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get('/api/resumes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const resume = await storage.getResumeById(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  // Job description routes
  app.post('/api/job-descriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobDescriptionData = insertJobDescriptionSchema.parse({
        ...req.body,
        userId,
      });

      // Analyze job description with AI
      const analysis = await groqService.analyzeJobDescription(jobDescriptionData.description);
      
      jobDescriptionData.extractedKeywords = analysis.extractedKeywords;
      jobDescriptionData.requiredSkills = analysis.requiredSkills;

      const jobDescription = await storage.createJobDescription(jobDescriptionData);
      res.json(jobDescription);
    } catch (error) {
      console.error("Error creating job description:", error);
      res.status(500).json({ message: "Failed to create job description" });
    }
  });

  app.get('/api/job-descriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobDescriptions = await storage.getJobDescriptionsByUserId(userId);
      res.json(jobDescriptions);
    } catch (error) {
      console.error("Error fetching job descriptions:", error);
      res.status(500).json({ message: "Failed to fetch job descriptions" });
    }
  });

  // Resume tailoring route
  app.post('/api/resumes/:resumeId/tailor', isAuthenticated, async (req: any, res) => {
    try {
      const { resumeId } = req.params;
      const { jobDescriptionId, versionName } = req.body;

      const resume = await storage.getResumeById(resumeId);
      const jobDescription = await storage.getJobDescriptionById(jobDescriptionId);

      if (!resume || !jobDescription) {
        return res.status(404).json({ message: "Resume or job description not found" });
      }

      // Get job keywords
      const jobKeywords = jobDescription.extractedKeywords as string[] || [];

      // Optimize resume using AI
      const optimization = await groqService.optimizeResumeForJob(
        resume.originalContent,
        jobDescription.description,
        jobKeywords
      );

      const versionData = insertResumeVersionSchema.parse({
        resumeId,
        jobDescriptionId,
        versionName: versionName || `${jobDescription.title} - ${new Date().toISOString().split('T')[0]}`,
        tailoredContent: optimization.optimizedContent,
        atsScore: optimization.atsScore.toString(),
        keywordMatches: optimization.keywordMatches,
        improvements: optimization.improvements,
      });

      const version = await storage.createResumeVersion(versionData);
      res.json(version);
    } catch (error) {
      console.error("Error tailoring resume:", error);
      res.status(500).json({ message: "Failed to tailor resume" });
    }
  });

  // Resume versions routes
  app.get('/api/resume-versions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const versions = await storage.getResumeVersionsByUserId(userId);
      
      // Enhance versions with job description details
      const enhancedVersions = await Promise.all(versions.map(async (version) => {
        const jobDescription = await storage.getJobDescriptionById(version.jobDescriptionId);
        return {
          ...version,
          jobTitle: jobDescription?.title || 'Unknown',
          company: jobDescription?.company || 'Unknown',
        };
      }));

      res.json(enhancedVersions);
    } catch (error) {
      console.error("Error fetching resume versions:", error);
      res.status(500).json({ message: "Failed to fetch resume versions" });
    }
  });

  app.get('/api/resume-versions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const version = await storage.getResumeVersionById(req.params.id);
      if (!version) {
        return res.status(404).json({ message: "Resume version not found" });
      }
      res.json(version);
    } catch (error) {
      console.error("Error fetching resume version:", error);
      res.status(500).json({ message: "Failed to fetch resume version" });
    }
  });

  // Cover letter routes
  app.post('/api/resume-versions/:versionId/cover-letter', isAuthenticated, async (req: any, res) => {
    try {
      const { versionId } = req.params;
      const { tone = 'professional' } = req.body;

      const version = await storage.getResumeVersionById(versionId);
      const jobDescription = await storage.getJobDescriptionById(version?.jobDescriptionId || '');

      if (!version || !jobDescription) {
        return res.status(404).json({ message: "Resume version or job description not found" });
      }

      const coverLetterGeneration = await groqService.generateCoverLetter(
        version.tailoredContent,
        jobDescription.description,
        tone
      );

      const coverLetterData = insertCoverLetterSchema.parse({
        resumeVersionId: versionId,
        content: coverLetterGeneration.content,
        tone: coverLetterGeneration.tone,
      });

      const coverLetter = await storage.createCoverLetter(coverLetterData);
      res.json(coverLetter);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  app.get('/api/resume-versions/:versionId/cover-letters', isAuthenticated, async (req: any, res) => {
    try {
      const { versionId } = req.params;
      const coverLetters = await storage.getCoverLettersByVersionId(versionId);
      res.json(coverLetters);
    } catch (error) {
      console.error("Error fetching cover letters:", error);
      res.status(500).json({ message: "Failed to fetch cover letters" });
    }
  });

  // Interview preparation routes
  app.post('/api/resume-versions/:versionId/interview-prep', isAuthenticated, async (req: any, res) => {
    try {
      const { versionId } = req.params;

      const version = await storage.getResumeVersionById(versionId);
      const jobDescription = await storage.getJobDescriptionById(version?.jobDescriptionId || '');

      if (!version || !jobDescription) {
        return res.status(404).json({ message: "Resume version or job description not found" });
      }

      const interviewPrep = await groqService.generateInterviewQuestions(
        version.tailoredContent,
        jobDescription.description
      );

      const questionsData = interviewPrep.questions.map(q => ({
        resumeVersionId: versionId,
        question: q.question,
        suggestedAnswer: q.suggestedAnswer,
        category: q.category,
        difficulty: q.difficulty,
      }));

      const questions = await storage.createInterviewQuestions(questionsData);
      res.json(questions);
    } catch (error) {
      console.error("Error generating interview questions:", error);
      res.status(500).json({ message: "Failed to generate interview questions" });
    }
  });

  app.get('/api/resume-versions/:versionId/interview-questions', isAuthenticated, async (req: any, res) => {
    try {
      const { versionId } = req.params;
      const questions = await storage.getInterviewQuestionsByVersionId(versionId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching interview questions:", error);
      res.status(500).json({ message: "Failed to fetch interview questions" });
    }
  });

  // Multi-job analysis route
  app.post('/api/multi-job-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const { resumeId, jobDescriptionIds } = req.body;

      const resume = await storage.getResumeById(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const jobDescriptions = await Promise.all(
        jobDescriptionIds.map((id: string) => storage.getJobDescriptionById(id))
      );

      const validJobDescriptions = jobDescriptions.filter(Boolean).map(jd => ({
        title: jd!.title,
        description: jd!.description,
      }));

      const analysis = await groqService.analyzeMultipleJobsForMasterResume(
        resume.originalContent,
        validJobDescriptions
      );

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing multiple jobs:", error);
      res.status(500).json({ message: "Failed to analyze multiple jobs" });
    }
  });

  // User statistics route
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
