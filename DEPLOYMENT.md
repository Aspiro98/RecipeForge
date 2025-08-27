# 🚀 RecipeForge Deployment Guide

## Quick Deployment Options

### Option 1: Railway (Recommended - Easiest)
1. **Fork/Clone** this repository to your GitHub
2. **Go to** [Railway.app](https://railway.app)
3. **Connect** your GitHub repository
4. **Add PostgreSQL** service from Railway dashboard
5. **Set Environment Variables**:
   - `DATABASE_URL` (from PostgreSQL service)
   - `SESSION_SECRET` (generate a random string)
   - `GROQ_API_KEY` (from [Groq Console](https://console.groq.com))
   - `NODE_ENV=production`
6. **Deploy** - Railway will automatically build and deploy

### Option 2: Render
1. **Connect** your GitHub repository to Render
2. **Create** a new Web Service
3. **Set Build Command**: `npm run build`
4. **Set Start Command**: `npm start`
5. **Add PostgreSQL** service
6. **Set Environment Variables** (same as Railway)
7. **Deploy**

### Option 3: DigitalOcean App Platform
1. **Connect** your GitHub repository
2. **Choose** the repository
3. **Select** Node.js environment
4. **Set Build Command**: `npm run build`
5. **Set Run Command**: `npm start`
6. **Add Database** (PostgreSQL)
7. **Set Environment Variables**
8. **Deploy**

### Option 4: Docker Deployment
```bash
# Build the image
docker build -t recipeforge .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL=your-db-url \
  -e SESSION_SECRET=your-secret \
  -e GROQ_API_KEY=your-groq-key \
  recipeforge
```

### Option 5: Local Production
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Set environment variables
export DATABASE_URL=your-db-url
export SESSION_SECRET=your-secret
export GROQ_API_KEY=your-groq-key
export NODE_ENV=production

# Start the application
npm start
```

## Required Environment Variables

```env
# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database

# Session (Required)
SESSION_SECRET=your-super-secret-session-key-here

# AI Service (Required)
GROQ_API_KEY=your-groq-api-key-here

# Server (Optional - defaults to 3000)
PORT=3000

# Environment (Optional - defaults to development)
NODE_ENV=production

# CORS (Optional - for custom domains)
CORS_ORIGIN=https://yourdomain.com
```

## Database Setup

### Option 1: Railway PostgreSQL
- Free tier available
- Automatic connection string generation
- No setup required

### Option 2: Supabase
- Free tier available
- PostgreSQL with real-time features
- Easy setup

### Option 3: Neon
- Free tier available
- Serverless PostgreSQL
- Automatic scaling

### Option 4: AWS RDS
- Production-ready
- Pay-per-use
- High availability

## Getting Your Groq API Key

1. **Sign up** at [console.groq.com](https://console.groq.com)
2. **Create** a new API key
3. **Copy** the key to your environment variables

## Post-Deployment

1. **Access** your application at the provided URL
2. **Test** the signup/login functionality
3. **Upload** a test resume
4. **Try** the resume tailoring feature
5. **Verify** all features work correctly

## Troubleshooting

### Build Fails
- Check Node.js version (requires 20+)
- Ensure all dependencies are installed
- Check for TypeScript errors

### Database Connection Fails
- Verify DATABASE_URL format
- Check database credentials
- Ensure database is accessible

### AI Features Don't Work
- Verify GROQ_API_KEY is set correctly
- Check Groq API quota/limits
- Test API key in Groq console

### File Upload Issues
- Ensure uploads directory exists
- Check file permissions
- Verify file size limits

## Support

For deployment issues:
1. Check the logs in your hosting platform
2. Verify all environment variables are set
3. Test locally first
4. Open an issue on GitHub

---

**Happy Deploying! 🎉**
