#!/bin/bash

# RecipeForge Development Startup Script
export DATABASE_URL="postgresql://postgres:password@localhost:5432/recipeforge"
export SESSION_SECRET="local-dev-secret"
export PORT=3000
export GROQ_API_KEY="your-groq-api-key-here"

echo "🚀 Starting RecipeForge development server..."
echo "📱 Access the app at: http://localhost:3000"
echo "🔐 Local authentication enabled - use POST /api/login to authenticate"
echo "🤖 AI features enabled with Groq API"
echo ""

npm run dev
