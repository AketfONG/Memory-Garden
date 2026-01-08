# 🚀 Deploy Memory Garden to Vercel

Quick guide to deploy your Memory Garden project on Vercel (free hosting).

## 📋 Prerequisites

1. **GitHub account** (free)
2. **Vercel account** (free) - sign up at [vercel.com](https://vercel.com)

## 🎯 Quick Deployment Steps

### Step 1: Prepare Your Code

```bash
# Make sure you're in the project directory
cd /Users/aket/Desktop/Memory-Garden-v0.5

# Install dependencies
npm install

# Test the build locally (optional but recommended)
npm run build
```

### Step 2: Push to GitHub

1. **Create a new GitHub repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name it `memory-garden` (or any name you prefer)
   - Make it **public** (required for free Vercel hosting)
   - Click "Create repository"

2. **Push your code**:
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Memory Garden v0.5"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/memory-garden.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy to Vercel

1. **Sign up/Login to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" and use your GitHub account

2. **Import your project**:
   - Click "Add New..." → "Project"
   - Select your `memory-garden` repository
   - Vercel will auto-detect it's a Next.js project

3. **Configure project settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables** (Important!):
   
   Click "Environment Variables" and add these:

   ```env
   # Database (if using Prisma/PostgreSQL)
   DATABASE_URL=your-database-url-here
   
   # NextAuth (if using authentication)
   NEXTAUTH_SECRET=generate-a-random-secret-key-here
   NEXTAUTH_URL=https://your-project-name.vercel.app
   
   # Optional: AI Services
   DEEPSEEK_API_KEY=your-deepseek-key-if-using
   GOOGLE_AI_API_KEY=your-google-ai-key-if-using
   GROQ_API_KEY=your-groq-key-if-using
   
   # Optional: Cloudinary (for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   **Note**: 
   - For `NEXTAUTH_SECRET`, generate a random string: `openssl rand -base64 32`
   - For `NEXTAUTH_URL`, use your Vercel deployment URL (you'll get this after first deploy)
   - Only add variables you're actually using in your app

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your site will be live at: `https://your-project-name.vercel.app`

## 🔧 Post-Deployment Setup

### Update NEXTAUTH_URL

After your first deployment:

1. Copy your deployment URL (e.g., `https://memory-garden-abc123.vercel.app`)
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual deployment URL
4. Redeploy (or it will auto-redeploy on next push)

### Database Setup (if using Prisma)

If you're using Prisma with a database:

1. **Option A: Use Vercel Postgres** (Free tier available):
   - In Vercel Dashboard → Storage → Create Database
   - Select "Postgres" → "Hobby" (Free)
   - Copy the connection string to `DATABASE_URL`

2. **Option B: Use external database** (Neon, Supabase, etc.):
   - Get connection string from your database provider
   - Add to `DATABASE_URL` environment variable

3. **Run migrations**:
   ```bash
   # Using Vercel CLI (install: npm i -g vercel)
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

## 📝 Important Notes

### Build Configuration

Your `next.config.ts` is already configured for production:
- ✅ `output: 'standalone'` - Optimized for Vercel
- ✅ `serverExternalPackages: ['@prisma/client']` - Prisma support
- ✅ TypeScript/ESLint errors ignored during build (for faster builds)

### Environment Variables

**Required for basic deployment:**
- None (your app works with localStorage by default)

**Optional (add only if using):**
- Database variables (if using Prisma)
- AI API keys (if using AI features)
- Cloudinary (if using file uploads)

### File Storage

Your app currently uses:
- **localStorage** for memory storage (works in browser)
- **Public folder** for demo images (works on Vercel)

**Note**: localStorage is browser-only. For persistent storage across devices, consider:
- Vercel Postgres (database)
- Cloudinary (file storage)
- Or another backend service

## 🎉 Success!

After deployment, you'll have:
- ✅ Live website: `https://your-project-name.vercel.app`
- ✅ Automatic deployments on every git push
- ✅ Preview deployments for pull requests
- ✅ Free SSL certificate
- ✅ Global CDN

## 🔄 Updating Your Site

Every time you push to GitHub:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically:
1. Detect the push
2. Build your project
3. Deploy the new version
4. Update your live site

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs** in Vercel Dashboard → Deployments → Click failed deployment
2. **Common issues**:
   - Missing environment variables
   - TypeScript errors (check `next.config.ts` - errors are ignored)
   - Missing dependencies (check `package.json`)

### Site Not Working

1. **Check function logs**: Vercel Dashboard → Functions
2. **Check browser console** for client-side errors
3. **Verify environment variables** are set correctly

### Database Issues

1. **Connection errors**: Verify `DATABASE_URL` is correct
2. **Migration errors**: Run `npx prisma migrate deploy` locally with production URL
3. **Prisma client**: Ensure `@prisma/client` is in dependencies

## 📚 Additional Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Vercel CLI**: Install with `npm i -g vercel` for local testing

## 💡 Pro Tips

1. **Use Vercel CLI for testing**:
   ```bash
   npm i -g vercel
   vercel login
   vercel  # Test deployment locally
   ```

2. **Preview deployments**: Every pull request gets its own preview URL

3. **Custom domain**: Add your domain in Vercel Dashboard → Settings → Domains

4. **Analytics**: Vercel provides built-in analytics (check Dashboard → Analytics)

---

**🎊 Congratulations!** Your Memory Garden is now live on the internet!

Your site URL: `https://your-project-name.vercel.app` 🌱✨

