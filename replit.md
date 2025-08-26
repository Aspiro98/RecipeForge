# TailorMyResume

## Overview

TailorMyResume is a modern, production-ready web application that helps students and job seekers automatically tailor their resumes for specific job applications using AI. The application analyzes job descriptions, extracts keywords, and uses OpenAI's API to optimize resume content for better ATS (Applicant Tracking System) compatibility and keyword matching.

The core functionality includes resume upload and parsing, AI-powered resume tailoring, multi-job analysis, cover letter generation, interview preparation, and comprehensive version control for tracking different resume iterations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent, accessible design
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Modular component architecture with reusable UI components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API with structured endpoint organization
- **File Processing**: Multer for file upload handling with support for PDF and DOCX formats
- **Session Management**: Express sessions with PostgreSQL storage for user persistence

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Strategy**: Relational design with separate tables for users, resumes, job descriptions, resume versions, cover letters, and interview questions
- **Connection**: Neon Database (serverless PostgreSQL) for scalable cloud hosting
- **Migration Management**: Drizzle Kit for database schema migrations

### Authentication System
- **Provider**: Replit Auth with OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Security**: HTTP-only cookies with secure session handling

### AI Integration
- **Provider**: OpenAI API (GPT-5 model) for content generation and analysis
- **Use Cases**: Resume content optimization, keyword extraction, cover letter generation, interview question creation
- **Processing**: Structured prompts for consistent AI responses with error handling and retry logic

### File Processing
- **Upload Handling**: Multer middleware with file type validation (PDF/DOCX only)
- **Storage**: Temporary file processing with automatic cleanup
- **Parsing**: Custom file processors for extracting text content from resume documents
- **Validation**: File size limits and type checking for security

### API Structure
- **Authentication**: `/api/auth/*` - User authentication and session management
- **Resumes**: `/api/resumes/*` - Resume upload, retrieval, and management
- **Job Descriptions**: `/api/job-descriptions/*` - Job posting management
- **Resume Versions**: `/api/resume-versions/*` - Tailored resume version control
- **AI Services**: Integrated within version endpoints for content generation

### Development Workflow
- **Development Server**: Vite dev server with HMR for frontend, tsx for backend hot reload
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Checking**: Shared TypeScript configuration across frontend, backend, and shared modules
- **Code Organization**: Monorepo structure with clear separation between client, server, and shared code

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **@neondatabase/serverless**: WebSocket-based database client for serverless environments

### AI and Content Processing
- **OpenAI API**: GPT-5 model for resume optimization, keyword analysis, and content generation
- **Custom file parsers**: PDF and DOCX text extraction for resume content analysis

### Authentication and Session Management
- **Replit Auth**: OpenID Connect authentication provider
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Passport.js**: Authentication middleware with OpenID Connect strategy

### UI and Design System
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Frontend build tool and development server
- **esbuild**: Backend bundling for production builds
- **TypeScript**: Type safety across the entire application
- **Drizzle ORM**: Type-safe database operations and migrations

### File Processing and Utilities
- **Multer**: File upload middleware for Express
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique identifier generation
- **memoizee**: Function memoization for performance optimization

### Real-time Features
- **WebSocket support**: Through Neon's WebSocket constructor for real-time database connections
- **Hot Module Replacement**: Vite HMR for instant development feedback