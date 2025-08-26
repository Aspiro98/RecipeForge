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

      // Sanitize the content before processing
      const sanitizedContent = this.sanitizeText(content);
      
      // Extract sections using simple text parsing
      const sections = this.extractSections(sanitizedContent);

      return {
        content: sanitizedContent,
        metadata: {
          fileName,
          fileSize: 0, // File size will be calculated differently since we delete the file
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
      const pdfBuffer = await fs.readFile(filePath);
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(pdfBuffer);
      return this.sanitizeText(data.text);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  private async parseDocx(filePath: string): Promise<string> {
    try {
      const docxBuffer = await fs.readFile(filePath);
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      return this.sanitizeText(result.value);
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      throw new Error('Failed to parse DOCX file');
    }
  }

  private sanitizeText(text: string): string {
    // Remove null bytes and other problematic characters that cause UTF-8 issues
    return text
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\uFFFD/g, '') // Remove replacement characters
      .trim();
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
