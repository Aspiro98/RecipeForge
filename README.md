# RecipeForge 🚀

A modern, AI-powered resume tailoring application that helps you optimize your resume for specific job applications using advanced ATS (Applicant Tracking System) scoring and AI-driven content optimization.

## ✨ Features

- **AI-Powered Resume Tailoring**: Optimize resumes for specific job descriptions
- **Dual ATS Scoring**: Jobscan-style and Resumeworded-style scoring methods
- **Cover Letter Generation**: AI-generated personalized cover letters
- **Interview Preparation**: Comprehensive interview questions and answers
- **Multi-Job Analysis**: Compare your resume across multiple job postings
- **Word Document Export**: Download ATS-friendly .docx resumes
- **Version History**: Track all your resume iterations
- **Local Authentication**: Secure user management

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Groq API (GPT-OSS-120B model)
- **File Processing**: PDF/DOCX parsing and Word document generation
- **Authentication**: Session-based local authentication

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Groq API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd RecipeForge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Using Docker
   docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=recipeforge -p 5432:5432 -d postgres:16-alpine
   
   # Or use your existing PostgreSQL instance
   ```

5. **Run database migrations**
   ```bash
   npm run db:push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended for local testing)

1. **Set environment variables**
   ```bash
   export GROQ_API_KEY=your-groq-api-key
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   ```
   http://localhost:3000
   ```

### Manual Docker Build

1. **Build the image**
   ```bash
   docker build -t recipeforge .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL=your-database-url \
     -e SESSION_SECRET=your-session-secret \
     -e GROQ_API_KEY=your-groq-api-key \
     recipeforge
   ```

## 🌐 Production Deployment

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# AI Service Configuration
GROQ_API_KEY=your-groq-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=production

# Optional: CORS Configuration
CORS_ORIGIN=https://yourdomain.com
```

### Deployment Options

#### 1. Railway
- Connect your GitHub repository
- Set environment variables in Railway dashboard
- Deploy automatically on push

#### 2. Render
- Connect your GitHub repository
- Set environment variables
- Use the Dockerfile for deployment

#### 3. DigitalOcean App Platform
- Connect your GitHub repository
- Set environment variables
- Use the Dockerfile for deployment

#### 4. AWS ECS/Fargate
- Build and push Docker image to ECR
- Deploy using ECS with Fargate
- Set up RDS for PostgreSQL

#### 5. Google Cloud Run
- Build and push Docker image to Container Registry
- Deploy using Cloud Run
- Use Cloud SQL for PostgreSQL

### Database Setup

For production, use a managed PostgreSQL service:

- **Railway**: Built-in PostgreSQL
- **Render**: PostgreSQL add-on
- **DigitalOcean**: Managed Databases
- **AWS**: RDS PostgreSQL
- **Google Cloud**: Cloud SQL

## 📁 Project Structure

```
RecipeForge/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Node.js backend
│   ├── services/          # Business logic services
│   ├── routes.ts          # API routes
│   ├── localAuth.ts       # Authentication
│   └── storage.ts         # Database operations
├── shared/                # Shared types and schemas
├── uploads/               # File upload directory
└── dist/                  # Build output
```

## 🔧 Configuration

### Database Schema

The application uses the following main tables:
- `users` - User accounts
- `resumes` - Uploaded resumes
- `job_descriptions` - Job postings
- `resume_versions` - Tailored resume versions
- `cover_letters` - Generated cover letters
- `interview_questions` - Interview preparation

### AI Configuration

The application uses Groq API with the `openai/gpt-oss-120b` model for:
- Resume optimization
- Keyword extraction
- Cover letter generation
- Interview question creation

## 🔒 Security

- Session-based authentication
- File upload validation
- SQL injection protection via Drizzle ORM
- Environment variable configuration
- Secure cookie settings

## 📝 API Endpoints

- `POST /api/login` - User login
- `POST /api/signup` - User registration
- `POST /api/resumes/upload` - Resume upload
- `POST /api/resumes/:id/tailor` - Resume tailoring
- `GET /api/resume-versions` - Get resume versions
- `POST /api/resume-versions/:id/cover-letter` - Generate cover letter
- `POST /api/resume-versions/:id/interview-prep` - Generate interview prep
- `GET /api/resume-versions/:id/download-word` - Download Word document

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**RecipeForge** - Optimize your resume with AI-powered precision! 🎯
