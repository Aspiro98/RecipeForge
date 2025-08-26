import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

interface ParsedResume {
  content: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    sections: {
      summary?: string;
      experience?: string[];
      education?: string[];
      skills?: string[];
    };
  };
}

export class FileProcessor {
  async parseResumeFile(filePath: string, fileName: string, fileType: string): Promise<ParsedResume> {
    try {
      let content = '';
      
      if (fileType === 'pdf') {
        content = await this.parsePDF(filePath);
      } else if (fileType === 'docx') {
        content = await this.parseDocx(filePath);
      } else {
        throw new Error('Unsupported file type');
      }

      // Clean up the uploaded file
      await fs.unlink(filePath);

      // Extract sections using simple text parsing
      const sections = this.extractSections(content);

      return {
        content,
        metadata: {
          fileName,
          fileSize: (await fs.stat(filePath).catch(() => ({ size: 0 }))).size,
          fileType,
          sections,
        },
      };
    } catch (error) {
      // Clean up file on error
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
      
      console.error('Error parsing resume file:', error);
      throw new Error('Failed to parse resume file');
    }
  }

  private async parsePDF(filePath: string): Promise<string> {
    try {
      // For production, you would use pdf-parse or similar library
      // For now, we'll simulate the parsing
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return fileContent;
    } catch (error) {
      // If direct text reading fails, return a placeholder that indicates PDF parsing is needed
      return 'PDF content extraction requires pdf-parse library. Please implement PDF parsing in production.';
    }
  }

  private async parseDocx(filePath: string): Promise<string> {
    try {
      // For production, you would use mammoth or similar library
      // For now, we'll simulate the parsing
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return fileContent;
    } catch (error) {
      // If direct text reading fails, return a placeholder that indicates DOCX parsing is needed
      return 'DOCX content extraction requires mammoth library. Please implement DOCX parsing in production.';
    }
  }

  private extractSections(content: string): {
    summary?: string;
    experience?: string[];
    education?: string[];
    skills?: string[];
  } {
    const sections: any = {};

    // Simple section extraction based on common headings
    const summaryMatch = content.match(/(?:summary|profile|objective|about)(.*?)(?=\n.*(?:experience|work|education|skills|contact))/is);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    // Extract experience section
    const experienceMatch = content.match(/(?:experience|work|employment)(.*?)(?=\n.*(?:education|skills|contact|references))/is);
    if (experienceMatch) {
      sections.experience = experienceMatch[1]
        .split(/\n\s*\n/)
        .map(exp => exp.trim())
        .filter(exp => exp.length > 0);
    }

    // Extract education section
    const educationMatch = content.match(/(?:education|academic)(.*?)(?=\n.*(?:skills|contact|references|certifications))/is);
    if (educationMatch) {
      sections.education = educationMatch[1]
        .split(/\n\s*\n/)
        .map(edu => edu.trim())
        .filter(edu => edu.length > 0);
    }

    // Extract skills section
    const skillsMatch = content.match(/(?:skills|technical|technologies)(.*?)(?=\n.*(?:contact|references|certifications|projects))/is);
    if (skillsMatch) {
      sections.skills = skillsMatch[1]
        .split(/[,;\n]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
    }

    return sections;
  }
}

export const fileProcessor = new FileProcessor();
export { upload };
