import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ""
});

interface KeywordAnalysis {
  extractedKeywords: string[];
  requiredSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  atsScore: number;
}

interface ResumeOptimization {
  optimizedContent: string;
  improvements: Array<{
    section: string;
    before: string;
    after: string;
    reasoning: string;
  }>;
  keywordMatches: string[];
  atsScore: number;
}

interface CoverLetterGeneration {
  content: string;
  tone: string;
  keyPoints: string[];
}

interface InterviewPrep {
  questions: Array<{
    question: string;
    suggestedAnswer: string;
    category: string;
    difficulty: string;
  }>;
}

export class GroqService {
  async analyzeJobDescription(jobDescription: string): Promise<KeywordAnalysis> {
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are an expert ATS analyzer. You MUST respond ONLY with valid JSON. Do not include any text before or after the JSON. Use this exact format:\n{\n  \"extractedKeywords\": [\"keyword1\", \"keyword2\"],\n  \"requiredSkills\": [\"skill1\", \"skill2\"],\n  \"atsScore\": 75\n}"
          },
          {
            role: "user",
            content: `Analyze this job description and extract keywords, skills, and provide an ATS score (0-100). Respond with JSON only:\n\n${jobDescription}`
          }
        ],
        temperature: 0.1,
      });

      const content = response.choices[0].message.content || '{}';
      
      // Try to extract JSON from the response if it's wrapped in text
      let jsonContent = content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      const result = JSON.parse(jsonContent);
      
      return {
        extractedKeywords: result.extractedKeywords || [],
        requiredSkills: result.requiredSkills || [],
        matchedKeywords: [],
        missingKeywords: result.extractedKeywords || [],
        atsScore: result.atsScore || 0,
      };
    } catch (error) {
      console.error('Error analyzing job description:', error);
      throw new Error('Failed to analyze job description');
    }
  }

  async optimizeResumeForJob(resumeContent: string, jobDescription: string, jobKeywords: string[]): Promise<ResumeOptimization> {
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are an expert resume optimizer. You MUST respond ONLY with valid JSON. Do not include any text before or after the JSON. Use this exact format:\n{\n  \"optimizedContent\": \"optimized resume text\",\n  \"improvements\": [{\"section\": \"section name\", \"before\": \"old text\", \"after\": \"new text\", \"reasoning\": \"explanation\"}],\n  \"keywordMatches\": [\"keyword1\", \"keyword2\"],\n  \"atsScore\": 85\n}"
          },
          {
            role: "user",
            content: `Optimize this resume for the job description. Include keywords: ${jobKeywords.join(', ')}. Respond with JSON only:\n\nResume:\n${resumeContent}\n\nJob:\n${jobDescription}`
          }
        ],
        temperature: 0.1,
      });

      const content = response.choices[0].message.content || '{}';
      
      // Try to extract JSON from the response if it's wrapped in text
      let jsonContent = content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      const result = JSON.parse(jsonContent);
      
      return {
        optimizedContent: result.optimizedContent || resumeContent,
        improvements: result.improvements || [],
        keywordMatches: result.keywordMatches || [],
        atsScore: result.atsScore || 0,
      };
    } catch (error) {
      console.error('Error optimizing resume:', error);
      throw new Error('Failed to optimize resume');
    }
  }

  async generateCoverLetter(resumeContent: string, jobDescription: string, tone: string = 'professional'): Promise<CoverLetterGeneration> {
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are an expert cover letter writer. Create compelling, personalized cover letters that highlight relevant experience and show genuine interest. Use a ${tone} tone. Respond with JSON in this exact format: { \"content\": \"cover letter text\", \"tone\": \"${tone}\", \"keyPoints\": [\"point1\", \"point2\"] }`
          },
          {
            role: "user",
            content: `Write a tailored cover letter based on:\n\nResume Content:\n${resumeContent}\n\nJob Description:\n${jobDescription}\n\nTone: ${tone}`
          }
        ],
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        content: result.content || '',
        tone: result.tone || tone,
        keyPoints: result.keyPoints || [],
      };
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw new Error('Failed to generate cover letter');
    }
  }

  async generateInterviewQuestions(resumeContent: string, jobDescription: string): Promise<InterviewPrep> {
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are an expert interview coach. Generate likely interview questions based on the job requirements and candidate's background, along with strong sample answers. Respond with JSON in this exact format: { \"questions\": [{\"question\": \"question text\", \"suggestedAnswer\": \"answer text\", \"category\": \"behavioral\", \"difficulty\": \"medium\"}] }"
          },
          {
            role: "user",
            content: `Generate 8-10 likely interview questions with sample answers based on:\n\nCandidate Resume:\n${resumeContent}\n\nJob Description:\n${jobDescription}\n\nInclude a mix of behavioral, technical, and situational questions with varying difficulty levels.`
          }
        ],
        temperature: 0.2,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        questions: result.questions || [],
      };
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  async analyzeMultipleJobsForMasterResume(resumeContent: string, jobDescriptions: Array<{ title: string, description: string }>): Promise<{
    commonKeywords: string[];
    masterOptimization: string;
    jobSpecificInsights: Array<{
      title: string;
      uniqueKeywords: string[];
      matchScore: number;
    }>;
  }> {
    try {
      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing multiple job postings to create master resume strategies. Identify common themes and create optimization recommendations. Respond with JSON in this exact format: { \"commonKeywords\": [\"keyword1\", \"keyword2\"], \"masterOptimization\": \"optimization text\", \"jobSpecificInsights\": [{\"title\": \"job title\", \"uniqueKeywords\": [\"keyword1\"], \"matchScore\": 85}] }"
          },
          {
            role: "user",
            content: `Analyze these job descriptions to create a master resume strategy:\n\nCurrent Resume:\n${resumeContent}\n\nJob Descriptions:\n${jobDescriptions.map((job, i) => `${i + 1}. ${job.title}:\n${job.description}`).join('\n\n')}`
          }
        ],
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        commonKeywords: result.commonKeywords || [],
        masterOptimization: result.masterOptimization || '',
        jobSpecificInsights: result.jobSpecificInsights || [],
      };
    } catch (error) {
      console.error('Error analyzing multiple jobs:', error);
      throw new Error('Failed to analyze multiple jobs');
    }
  }
}

export const groqService = new GroqService();
