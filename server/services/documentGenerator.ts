import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType, Table, TableRow, TableCell } from 'docx';

export interface ResumeSection {
  title: string;
  content: string[];
}

export interface WordDocumentOptions {
  fileName: string;
  sections: ResumeSection[];
  userName?: string;
  userDetails?: string;
  includeATSKeywords?: boolean;
  keywords?: string[];
}

export class DocumentGenerator {
  async generateATSResume(options: WordDocumentOptions): Promise<Buffer> {
    const { fileName, sections, userName, userDetails, includeATSKeywords = false, keywords = [] } = options;

    const children: any[] = [];

    // Add user name as title
    if (userName) {
      children.push(
        new Paragraph({
          text: userName,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 200,
          },
        })
      );
    }

    // Add user title/position if available
    const titleSection = sections.find(s => s.title.toUpperCase().includes('TITLE') || s.title.toUpperCase().includes('POSITION'));
    if (titleSection && titleSection.content.length > 0) {
      children.push(
        new Paragraph({
          text: titleSection.content[0],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 200,
          },
        })
      );
    }

    // Add contact information line
    if (userDetails) {
      children.push(
        new Paragraph({
          text: userDetails,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        })
      );
    } else {
      // Fallback to placeholders if no contact info found
      children.push(
        new Paragraph({
          text: "Phone | Email | LinkedIn | GitHub | Location",
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        })
      );
    }

    // Define section order and ensure no duplicates
    const sectionOrder = ['SUMMARY', 'EDUCATION', 'SKILLS', 'EXPERIENCE', 'PROJECTS', 'CERTIFICATIONS'];
    
    // Remove any combined sections and separate them
    const cleanSections = sections.filter(s => 
      !(s.title.toUpperCase().includes('SKILLS') && s.title.toUpperCase().includes('CERTIFICATIONS'))
    );
    
    // Find and separate combined sections
    const combinedSection = sections.find(s => 
      s.title.toUpperCase().includes('SKILLS') && s.title.toUpperCase().includes('CERTIFICATIONS')
    );
    
    if (combinedSection) {
      const skillsContent = combinedSection.content.filter(item => 
        !item.toUpperCase().includes('CERTIFICATION') && 
        !item.toUpperCase().includes('CERTIFIED') &&
        !item.toUpperCase().includes('AWS') &&
        !item.toUpperCase().includes('MICROSOFT') &&
        !item.toUpperCase().includes('SCRUM')
      );
      
      const certificationsContent = combinedSection.content.filter(item => 
        item.toUpperCase().includes('CERTIFICATION') || 
        item.toUpperCase().includes('CERTIFIED') ||
        item.toUpperCase().includes('AWS') ||
        item.toUpperCase().includes('MICROSOFT') ||
        item.toUpperCase().includes('SCRUM')
      );

      if (skillsContent.length > 0) {
        cleanSections.push({
          title: 'SKILLS',
          content: skillsContent
        });
      }
      
      if (certificationsContent.length > 0) {
        cleanSections.push({
          title: 'CERTIFICATIONS',
          content: certificationsContent
        });
      }
    }
    
    // Sort sections according to the order
    const finalSections = sectionOrder.map(sectionName => {
      return cleanSections.find(s => s.title.toUpperCase().includes(sectionName));
    }).filter(Boolean);

    // Add sections
    finalSections.forEach((section) => {
      if (!section) return;
      
      // Section title
      children.push(
        new Paragraph({
          text: section.title.toUpperCase(),
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 200,
          },
          border: {
            bottom: {
              color: "000000",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 1,
            },
          },
        })
      );

      // Handle different sections differently
      const sectionTitle = section.title.toUpperCase();
      
      if (sectionTitle.includes('SUMMARY')) {
        // Summary: no bullet points, just direct text
        section.content.forEach((item) => {
          if (item.trim()) {
            children.push(
              new Paragraph({
                text: item,
                spacing: {
                  before: 120,
                  after: 120,
                },
              })
            );
          }
        });
      } else if (sectionTitle.includes('EDUCATION')) {
        // Education: format as Degree – University (Dates) on one line
        section.content.forEach((item) => {
          if (item.trim()) {
            // Check if this is a subsection (institution name)
            if (item.startsWith('SUBSECTION: ')) {
              const institution = item.replace('SUBSECTION: ', '');
              children.push(
                new Paragraph({
                  text: institution,
                  spacing: {
                    before: 240,
                    after: 120,
                  },
                })
              );
            } else if (item.startsWith('CONTENT: ')) {
              const content = item.replace('CONTENT: ', '');
              // Format as Degree – University (Dates)
              const formattedContent = this.formatEducationLine(content);
              children.push(
                new Paragraph({
                  text: formattedContent,
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                })
              );
            } else {
              // Format as Degree – University (Dates)
              const formattedContent = this.formatEducationLine(item);
              children.push(
                new Paragraph({
                  text: formattedContent,
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                })
              );
            }
          }
        });
      } else if (sectionTitle.includes('SKILLS')) {
        // Skills: organized into categories with consistent formatting
        const skillsByCategory = this.organizeSkillsIntoCategories(section.content);
        
        // Define category order and default skills
        const categoryOrder = ['Languages', 'Frameworks/Libraries', 'Databases', 'Cloud/DevOps', 'Tools', 'Practices'];
        const defaultSkills = {
          'Languages': ['Java', 'Python', 'JavaScript (ES6+)', 'TypeScript', 'C++', 'HTML5', 'CSS3', 'Kotlin', 'Swift'],
          'Frameworks/Libraries': ['Spring Boot', 'Node.js', 'React', 'React Native', 'Express', 'Laravel'],
          'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Firebase'],
          'Cloud/DevOps': ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'CI/CD'],
          'Tools': ['Git', 'Jira', 'Visual Studio', 'Postman', 'Tableau'],
          'Practices': ['Agile/Scrum', 'Code Reviews', 'TDD', 'Unit Testing', 'Automated Testing']
        };
        
        categoryOrder.forEach(category => {
          let skills = skillsByCategory[category] || [];
          
          // If no skills found for category, use defaults
          if (skills.length === 0) {
            skills = defaultSkills[category as keyof typeof defaultSkills] || [];
          }
          
          if (skills.length > 0) {
            // Remove duplicates and sort skills
            const uniqueSkills = Array.from(new Set(skills)).sort();
            
            // Create category line with aligned formatting
            const categoryLine = `${category}:${' '.repeat(Math.max(1, 20 - category.length))}${uniqueSkills.join(', ')}`;
            
            children.push(
              new Paragraph({
                text: categoryLine,
                spacing: {
                  before: 120,
                  after: 120,
                },
              })
            );
          }
        });
      } else if (sectionTitle.includes('EXPERIENCE')) {
        // Experience: bold job titles, dates aligned right, bullet points
        let currentSubsection: string | null = null;
        
        section.content.forEach((item) => {
          if (item.trim()) {
            if (item.startsWith('SUBSECTION: ')) {
              currentSubsection = item.replace('SUBSECTION: ', '');
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: currentSubsection,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: {
                    before: 240,
                    after: 120,
                  },
                })
              );
            } else if (item.startsWith('CONTENT: ')) {
              const content = item.replace('CONTENT: ', '');
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                      bold: true,
                    }),
                    new TextRun({
                      text: content,
                    }),
                  ],
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                  indent: {
                    left: 720,
                  },
                })
              );
            } else {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                      bold: true,
                    }),
                    new TextRun({
                      text: item,
                    }),
                  ],
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                  indent: {
                    left: 720,
                  },
                })
              );
            }
          }
        });
      } else if (sectionTitle.includes('PROJECTS')) {
        // Projects: bold project names, bullet points
        let currentSubsection: string | null = null;
        
        section.content.forEach((item) => {
          if (item.trim()) {
            if (item.startsWith('SUBSECTION: ')) {
              currentSubsection = item.replace('SUBSECTION: ', '');
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: currentSubsection,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: {
                    before: 240,
                    after: 120,
                  },
                })
              );
            } else if (item.startsWith('CONTENT: ')) {
              const content = item.replace('CONTENT: ', '');
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                      bold: true,
                    }),
                    new TextRun({
                      text: content,
                    }),
                  ],
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                  indent: {
                    left: 720,
                  },
                })
              );
            } else {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                      bold: true,
                    }),
                    new TextRun({
                      text: item,
                    }),
                  ],
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                  indent: {
                    left: 720,
                  },
                })
              );
            }
          }
        });
      } else if (sectionTitle.includes('CERTIFICATIONS')) {
        // Certifications: format with name + year in parentheses
        let currentSubsection: string | null = null;
        
        section.content.forEach((item) => {
          if (item.trim()) {
            if (item.startsWith('SUBSECTION: ')) {
              currentSubsection = item.replace('SUBSECTION: ', '');
              // Extract year if available
              const yearMatch = currentSubsection.match(/\((\d{4})\)/);
              const year = yearMatch ? yearMatch[1] : '';
              const name = currentSubsection.replace(/\(\d{4}\)/, '').trim();
              
              const formattedCert = year ? `${name} (${year})` : name;
              
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: formattedCert,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: {
                    before: 240,
                    after: 120,
                  },
                })
              );
            } else if (item.startsWith('CONTENT: ')) {
              const content = item.replace('CONTENT: ', '');
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                      bold: true,
                    }),
                    new TextRun({
                      text: content,
                    }),
                  ],
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                  indent: {
                    left: 720,
                  },
                })
              );
            } else {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                      bold: true,
                    }),
                    new TextRun({
                      text: item,
                    }),
                  ],
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                  indent: {
                    left: 720,
                  },
                })
              );
            }
          }
        });
      } else {
        // Other sections: with subsections and bullet points
        let currentSubsection: string | null = null;
        
        section.content.forEach((item) => {
          if (item.trim()) {
            // Check if this is a subsection marker
            if (item.startsWith('SUBSECTION: ')) {
              currentSubsection = item.replace('SUBSECTION: ', '');
              // Add subsection as bold text
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: currentSubsection,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: {
                    before: 240,
                    after: 120,
                  },
                })
              );
            } else if (item.startsWith('CONTENT: ')) {
              // This is content under a subsection
              const content = item.replace('CONTENT: ', '');
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                      bold: true,
                    }),
                    new TextRun({
                      text: content,
                    }),
                  ],
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                  indent: {
                    left: 720, // 0.5 inch
                  },
                })
              );
            } else {
              // Regular content
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• ",
                      bold: true,
                    }),
                    new TextRun({
                      text: item,
                    }),
                  ],
                  spacing: {
                    before: 120,
                    after: 120,
                  },
                  indent: {
                    left: 720, // 0.5 inch
                  },
                })
              );
            }
          }
        });
      }
    });



    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children,
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  // Enhanced parsing for better structure detection
  parseResumeContentEnhanced(content: string): ResumeSection[] {
    const lines = content.split('\n').filter(line => line.trim());
    const sections: ResumeSection[] = [];
    let currentSection: ResumeSection | null = null;
    let currentSubsection: string | null = null;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Check if this is a main section header
      const mainSectionHeaders = [
        'SUMMARY', 'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT',
        'EDUCATION', 'PROJECTS', 'SKILLS', 'TECHNICAL SKILLS',
        'CERTIFICATIONS', 'AWARDS', 'PUBLICATIONS', 'LANGUAGES'
      ];
      
      const isMainSectionHeader = mainSectionHeaders.some(header => 
        trimmedLine.toUpperCase().includes(header) && 
        trimmedLine.length < 50 && 
        !trimmedLine.includes('•') && 
        !trimmedLine.includes('-') &&
        !trimmedLine.includes('–')
      );

      // Check if this is a subsection (company name, project name, etc.)
      const isSubsection = !isMainSectionHeader && 
        trimmedLine.length > 0 && 
        trimmedLine.length < 100 &&
        !trimmedLine.startsWith('•') &&
        !trimmedLine.startsWith('-') &&
        !trimmedLine.startsWith('*') &&
        (trimmedLine.includes('–') || 
         trimmedLine.includes('-') || 
         trimmedLine.includes('(') ||
         trimmedLine.includes('Tech Stack:') ||
         trimmedLine.includes('Stack:'));

      if (isMainSectionHeader) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine,
          content: [],
        };
        currentSubsection = null;
      } else if (isSubsection && currentSection) {
        // This is a subsection (like company name, project name)
        currentSubsection = trimmedLine;
        currentSection.content.push(`SUBSECTION: ${trimmedLine}`);
      } else if (currentSection && trimmedLine) {
        // This is content (bullet points, descriptions)
        const cleanContent = trimmedLine.replace(/^[•\-\*]\s*/, '').trim();
        if (cleanContent) {
          if (currentSubsection) {
            currentSection.content.push(`CONTENT: ${cleanContent}`);
          } else {
            currentSection.content.push(cleanContent);
          }
        }
      }
    });

    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  parseResumeContent(content: string): ResumeSection[] {
    const lines = content.split('\n').filter(line => line.trim());
    const sections: ResumeSection[] = [];
    let currentSection: ResumeSection | null = null;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Check if this is a section header (all caps, common section names)
      const sectionHeaders = [
        'SUMMARY', 'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT',
        'EDUCATION', 'PROJECTS', 'SKILLS', 'TECHNICAL SKILLS',
        'CERTIFICATIONS', 'AWARDS', 'PUBLICATIONS', 'LANGUAGES'
      ];
      
      const isSectionHeader = sectionHeaders.some(header => 
        trimmedLine.toUpperCase().includes(header) && 
        trimmedLine.length < 50 && 
        !trimmedLine.includes('•') && 
        !trimmedLine.includes('-')
      );

      if (isSectionHeader) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine,
          content: [],
        };
      } else if (currentSection && trimmedLine) {
        // Remove bullet points and clean up the content
        const cleanContent = trimmedLine.replace(/^[•\-\*]\s*/, '').trim();
        if (cleanContent) {
          currentSection.content.push(cleanContent);
        }
      }
    });

    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  organizeSkillsIntoCategories(content: string[]): Record<string, string[]> {
    const skillsByCategory: Record<string, string[]> = {
      'Languages': [],
      'Frameworks/Libraries': [],
      'Databases': [],
      'Cloud/DevOps': [],
      'Tools': [],
      'Practices': []
    };

    // Define skill mappings with standardized names
    const skillMappings = {
      'Languages': [
        'java', 'python', 'javascript', 'typescript', 'c#', 'c++', 'html', 'css', 'sql', 'dart', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala'
      ],
      'Frameworks/Libraries': [
        'spring', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'asp.net', 'laravel', 'flutter', 'jquery', 'bootstrap', 'tailwind', 'next.js', 'nuxt.js'
      ],
      'Databases': [
        'mysql', 'postgresql', 'mongodb', 'sql server', 'oracle', 'dynamodb', 'redis', 'elasticsearch', 'firebase', 'cassandra', 'neo4j'
      ],
      'Cloud/DevOps': [
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'ci/cd', 'terraform', 'ansible', 'nginx', 'apache', 'helm', 'prometheus', 'github actions'
      ],
      'Tools': [
        'visual studio', 'vs code', 'intellij', 'eclipse', 'postman', 'jira', 'confluence', 'figma', 'sketch', 'cursor ai', 'chatgpt', 'maven', 'gradle', 'npm', 'yarn', 'tableau'
      ],
      'Practices': [
        'agile', 'scrum', 'kanban', 'tdd', 'bdd', 'unit testing', 'integration testing', 'code review', 'pair programming', 'devops', 'system design', 'security', 'automation', 'microservices', 'api design', 'rest apis', 'graphql', 'automated testing'
      ]
    };

    // Process each content item
    content.forEach(item => {
      if (item.trim()) {
        // Remove security clearance content
        if (item.toLowerCase().includes('security clearance') || 
            item.toLowerCase().includes('eligible') ||
            item.toLowerCase().includes('u.s. citizen')) {
          return;
        }

        // Extract skills from the content
        const skills = this.extractSkillsFromContent(item);
        
        // Categorize each skill
        skills.forEach(skill => {
          const normalizedSkill = skill.toLowerCase().trim();
          let categorized = false;
          
          // Check each category
          for (const [category, keywords] of Object.entries(skillMappings)) {
            if (keywords.some(keyword => normalizedSkill.includes(keyword))) {
              if (!skillsByCategory[category].includes(skill)) {
                skillsByCategory[category].push(skill);
              }
              categorized = true;
              break;
            }
          }
          
          // If not categorized, add to Languages as default
          if (!categorized && !skillsByCategory['Languages'].includes(skill)) {
            skillsByCategory['Languages'].push(skill);
          }
        });
      }
    });

    return skillsByCategory;
  }

  extractSkillsFromContent(content: string): string[] {
    // Remove common prefixes and clean up
    let cleanContent = content.replace(/^(languages?|frameworks?|databases?|tools?|practices?):\s*/i, '');
    
    // Split by commas and clean up each skill
    const skills = cleanContent.split(',').map(skill => {
      return this.standardizeSkillName(skill.trim()
        .replace(/^[•\-\*]\s*/, '') // Remove bullet points
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\.$/, '')); // Remove trailing periods
    }).filter(skill => skill.length > 0);
    
    return skills;
  }

  formatEducationLine(content: string): string {
    // Extract degree, university, and dates
    const degreeMatch = content.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const universityMatch = content.match(/(University|College|Institute|School)/i);
    const dateMatch = content.match(/(\d{4}[-–]\d{4}|\d{4})/);
    
    if (degreeMatch && universityMatch) {
      const degree = degreeMatch[0];
      const university = universityMatch[0];
      const dates = dateMatch ? `(${dateMatch[0]})` : '';
      
      return `${degree} – ${university} ${dates}`.trim();
    }
    
    return content;
  }

  standardizeSkillName(skill: string): string {
    const skillLower = skill.toLowerCase();
    
    // Standardize common variations
    const standardizations: Record<string, string> = {
      'postgres': 'PostgreSQL',
      'postgresql': 'PostgreSQL',
      'postgres sql': 'PostgreSQL',
      'nodejs': 'Node.js',
      'node.js': 'Node.js',
      'reactjs': 'React.js',
      'react.js': 'React.js',
      'angularjs': 'Angular.js',
      'angular.js': 'Angular.js',
      'vuejs': 'Vue.js',
      'vue.js': 'Vue.js',
      'expressjs': 'Express.js',
      'express.js': 'Express.js',
      'spring boot': 'Spring Boot',
      'springboot': 'Spring Boot',
      'asp.net': 'ASP.NET',
      'aspnet': 'ASP.NET',
      'rest api': 'REST APIs',
      'rest apis': 'REST APIs',
      'restapi': 'REST APIs',
      'ci/cd': 'CI/CD',
      'cicd': 'CI/CD',
      'vs code': 'VS Code',
      'vscode': 'VS Code',
      'visual studio code': 'VS Code',
      'nextjs': 'Next.js',
      'next.js': 'Next.js',
      'nuxtjs': 'Nuxt.js',
      'nuxt.js': 'Nuxt.js',
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'html5': 'HTML5',
      'css3': 'CSS3',
      'aws': 'AWS',
      'azure': 'Azure',
      'gcp': 'GCP',
      'kubernetes': 'Kubernetes',
      'docker': 'Docker',
      'jenkins': 'Jenkins',
      'git': 'Git',
      'github': 'GitHub',
      'gitlab': 'GitLab',
      'terraform': 'Terraform',
      'ansible': 'Ansible',
      'nginx': 'Nginx',
      'apache': 'Apache',
      'mysql': 'MySQL',
      'mongodb': 'MongoDB',
      'redis': 'Redis',
      'elasticsearch': 'Elasticsearch',
      'firebase': 'Firebase',
      'cassandra': 'Cassandra',
      'neo4j': 'Neo4j',
      'java': 'Java',
      'python': 'Python',
      'c#': 'C#',
      'c++': 'C++',
      'sql': 'SQL',
      'dart': 'Dart',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'scala': 'Scala',
      'agile': 'Agile',
      'scrum': 'Scrum',
      'kanban': 'Kanban',
      'tdd': 'TDD',
      'bdd': 'BDD',
      'unit testing': 'Unit Testing',
      'integration testing': 'Integration Testing',
      'code review': 'Code Review',
      'pair programming': 'Pair Programming',
      'devops': 'DevOps',
      'system design': 'System Design',
      'security': 'Security',
      'automation': 'Automation',
      'microservices': 'Microservices',
      'api design': 'API Design',
      'graphql': 'GraphQL'
    };

    // Check for exact matches first
    for (const [variant, standard] of Object.entries(standardizations)) {
      if (skillLower === variant.toLowerCase()) {
        return standard;
      }
    }

    // Check for partial matches
    for (const [variant, standard] of Object.entries(standardizations)) {
      if (skillLower.includes(variant.toLowerCase())) {
        return standard;
      }
    }

    // If no match found, capitalize first letter of each word
    return skill.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}

export const documentGenerator = new DocumentGenerator();
