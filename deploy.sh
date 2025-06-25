#!/bin/bash

echo "🚀 Starting FurryFriendsConnect deployment to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to set up your environment variables in the Vercel dashboard:"
echo "   - DATABASE_URL"
echo "   - SESSION_SECRET"
echo "   - GEMINI_API_KEY"
echo "   - NODE_ENV=production" 