# Vercel Deployment Guide for FurryFriendsConnect

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Set up a PostgreSQL database (recommended: Neon, Supabase, or Railway)
3. **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Prepare Your Database

1. Set up a PostgreSQL database
2. Run the database migrations:
   ```bash
   npm run db:push
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project root:
   ```bash
   cd FurryFriendsConnect
   vercel
   ```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project settings

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add:

```
DATABASE_URL=your_database_connection_string
SESSION_SECRET=your_random_session_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production
```

## Step 4: Configure Build Settings

In Vercel project settings:

- **Framework Preset**: Other
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

## Step 5: Configure Functions

The `vercel.json` file is already configured to:
- Route `/api/*` requests to the serverless function
- Route `/uploads/*` requests to the serverless function
- Serve static files from the build output

## Troubleshooting

### Common Issues:

1. **Build Fails**: Make sure all dependencies are in `package.json`
2. **Database Connection**: Verify your `DATABASE_URL` is correct
3. **File Uploads**: Vercel has a 4.5MB limit for serverless functions
4. **Session Issues**: Ensure `SESSION_SECRET` is set

### File Upload Limitations:

Vercel serverless functions have a 4.5MB payload limit. For larger files, consider:
- Using a separate file storage service (AWS S3, Cloudinary)
- Implementing client-side image compression
- Using Vercel's Edge Functions for larger payloads

### Database Considerations:

- Use connection pooling for better performance
- Consider using Neon's serverless driver for better Vercel compatibility
- Ensure your database allows connections from Vercel's IP ranges

## Post-Deployment

1. Test all features: user registration, pet submission, AI matching
2. Monitor function execution times and cold starts
3. Set up monitoring and error tracking
4. Configure custom domain if needed

## Support

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Verify environment variables are set correctly
3. Test database connectivity
4. Review the deployment logs for build errors 