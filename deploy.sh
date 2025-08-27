#!/bin/bash

# RecipeForge Deployment Script
echo "🚀 Starting RecipeForge deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one from env.example"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🎉 RecipeForge is ready for deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up your database (PostgreSQL)"
    echo "2. Configure environment variables in .env"
    echo "3. Run database migrations: npm run db:push"
    echo "4. Start the application: npm start"
    echo ""
    echo "🐳 For Docker deployment:"
    echo "   docker-compose up -d"
    echo ""
    echo "🌐 For production deployment, see README.md"
else
    echo "❌ Build failed!"
    exit 1
fi
