# 🚂 Railway Database Setup Guide

## Quick Setup Steps:

### 1. Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### 2. Add PostgreSQL Database
1. Click "New" → "Database" → "PostgreSQL"
2. Wait for it to provision (2-3 minutes)
3. Click on the PostgreSQL service
4. Go to "Connect" tab
5. Copy the connection string

### 3. Set Up Your Database
```bash
# Set your Railway database URL
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway"

# Run the setup
npm run db:setup
```

### 4. Deploy to Production
When deploying to Vercel/Netlify:
1. Set `DATABASE_URL` environment variable
2. Run `npm run db:migrate` after deployment

## Benefits:
- ✅ Easy setup (5 minutes)
- ✅ Free tier available
- ✅ No DNS issues
- ✅ Reliable connection
- ✅ Built-in monitoring

---

**Need help?** The Railway setup is much more reliable than Supabase for this use case.







