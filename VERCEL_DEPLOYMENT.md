# 🌱 Free Vercel Deployment Guide for Memory Garden

This guide will help you deploy your Memory Garden application for **FREE** on Vercel with a PostgreSQL database.

## 🎯 What You'll Get

- **Free hosting** on Vercel (Hobby plan)
- **Free PostgreSQL database** via Vercel Postgres
- **Free file storage** via Cloudinary (free tier)
- **Free AI generation** via Hugging Face (free tier)
- **Custom domain** support (optional)

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Vercel Account** (free)
3. **Cloudinary Account** (free tier)
4. **Hugging Face Account** (free tier)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code

First, let's ensure your code is ready for deployment:

```bash
# Make sure you're in the project directory
cd Memory-Garden-v0.3

# Install dependencies
npm install

# Test the build locally
npm run build
```

### Step 2: Push to GitHub

1. **Create a new GitHub repository**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `memory-garden-v0.3`
   - Make it public (for free hosting)
   - Don't initialize with README (we already have one)

2. **Push your code**:
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Memory Garden v0.3"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/memory-garden-v0.3.git
git branch -M main
git push -u origin main
```

### Step 3: Set Up Vercel

1. **Sign up for Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" and use your GitHub account

2. **Import your project**:
   - Click "New Project"
   - Select your `memory-garden-v0.3` repository
   - Vercel will auto-detect it's a Next.js project

### Step 4: Set Up Free PostgreSQL Database

1. **Add Vercel Postgres**:
   - In your Vercel project dashboard
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose "Hobby" plan (FREE)
   - Name it `memory-garden-db`

2. **Get your database URL**:
   - After creation, click on your database
   - Copy the "Connection String" (starts with `postgresql://`)

### Step 5: Set Up Cloudinary (Free File Storage)

1. **Create Cloudinary account**:
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account
   - Get your credentials from Dashboard

2. **Get your credentials**:
   - Cloud Name
   - API Key
   - API Secret

### Step 6: Set Up Hugging Face (Free AI)

1. **Create Hugging Face account**:
   - Go to [huggingface.co](https://huggingface.co)
   - Sign up for free account

2. **Get API token**:
   - Go to Settings → Access Tokens
   - Create new token
   - Copy the token

### Step 7: Configure Environment Variables

In your Vercel project dashboard:

1. **Go to Settings → Environment Variables**
2. **Add these variables**:

```env
# Database (from Vercel Postgres)
DATABASE_URL=postgresql://... (from Step 4)

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=https://your-project-name.vercel.app

# Cloudinary (from Step 5)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Hugging Face (from Step 6)
HUGGING_FACE_API_KEY=your-hugging-face-token

# Optional: Google OAuth (if you want Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 8: Deploy

1. **Trigger deployment**:
   - Vercel will automatically deploy when you push to GitHub
   - Or click "Redeploy" in the Vercel dashboard

2. **Set up database**:
   - After first deployment, go to your project URL
   - You'll see an error about database (expected)
   - Go to Vercel dashboard → Functions
   - Find the deployment logs to see any database errors

3. **Run database setup**:
```bash
# In Vercel dashboard, go to Functions tab
# You can run this via Vercel CLI or add a setup script
```

### Step 9: Database Migration

Since Vercel doesn't allow direct database access, we need to handle migrations:

1. **Add a setup API route**:
   Create `app/api/setup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // This will create tables if they don't exist
    await prisma.$executeRaw`SELECT 1`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed' 
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      error: 'Database setup failed' 
    }, { status: 500 });
  }
}
```

2. **Call the setup endpoint**:
   - Visit: `https://your-project.vercel.app/api/setup`
   - This will initialize your database

## 🎉 Your Free Hosting Setup

After deployment, you'll have:

- **🌐 Website**: `https://your-project-name.vercel.app`
- **🗄️ Database**: Vercel Postgres (free tier)
- **📁 File Storage**: Cloudinary (free tier)
- **🤖 AI Generation**: Hugging Face (free tier)

## 📊 Free Tier Limits

### Vercel (Hobby Plan)
- ✅ **Unlimited** deployments
- ✅ **100GB** bandwidth/month
- ✅ **100GB** storage
- ✅ **10GB** database storage
- ✅ **Custom domains** (with SSL)

### Cloudinary (Free Tier)
- ✅ **25GB** storage
- ✅ **25GB** bandwidth/month
- ✅ **25GB** video storage

### Hugging Face (Free Tier)
- ✅ **30,000** API calls/month
- ✅ **Basic models** access

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check `DATABASE_URL` in environment variables
   - Ensure Vercel Postgres is created and running

2. **Build Errors**:
   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`

3. **Environment Variables**:
   - Double-check all variables are set correctly
   - Ensure no extra spaces or quotes

4. **File Upload Issues**:
   - Verify Cloudinary credentials
   - Check file size limits

### Getting Help:

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Project Issues**: Create an issue in your GitHub repository

## 🚀 Next Steps

1. **Custom Domain** (Optional):
   - In Vercel dashboard → Settings → Domains
   - Add your custom domain
   - Update `NEXTAUTH_URL` to your custom domain

2. **Monitor Usage**:
   - Check Vercel dashboard for bandwidth usage
   - Monitor Cloudinary usage in their dashboard
   - Track Hugging Face API calls

3. **Scale Up** (When Needed):
   - Vercel Pro: $20/month for more bandwidth
   - Cloudinary: Pay-as-you-go for more storage
   - Hugging Face: Pro plans for more API calls

## 💡 Pro Tips

1. **Use Vercel CLI** for easier management:
```bash
npm i -g vercel
vercel login
vercel --prod
```

2. **Set up automatic deployments**:
   - Every push to `main` branch auto-deploys
   - Preview deployments for pull requests

3. **Monitor performance**:
   - Vercel provides built-in analytics
   - Check Core Web Vitals in Google PageSpeed Insights

---

**🎉 Congratulations!** Your Memory Garden is now live on the internet for free! 

Share your website: `https://your-project-name.vercel.app` 🌱✨ 