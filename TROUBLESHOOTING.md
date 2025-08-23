# 🔧 Memory Garden Troubleshooting Guide

## ✅ Current Status: WORKING

Your Memory Garden is now running successfully at **http://localhost:3000**!

## 🚨 Common Issues & Solutions

### 1. Internal Server Error (500)

**Problem**: You see "Internal Server Error" on localhost:3000

**Solution**: 
```bash
# Stop the server and clean up
pkill -f "next dev"
rm -rf .next

# Restart with the dev setup script
./scripts/dev-setup.sh
```

### 2. Database Connection Errors

**Problem**: API routes fail with database errors

**Solution**: 
- For local development, the app will work without a real database
- For production, set up Vercel Postgres (FREE)
- Check your `.env.local` file has the correct `DATABASE_URL`

### 3. Build Errors

**Problem**: `npm run build` fails

**Solution**:
```bash
# Clean and regenerate
rm -rf .next
npx prisma generate
npm run build
```

### 4. Port Already in Use

**Problem**: "Port 3000 is already in use"

**Solution**:
```bash
# Kill any existing processes
pkill -f "next dev"
pkill -f "node.*3000"

# Or use a different port
npm run dev -- -p 3001
```

## 🧪 Testing Your Setup

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```
Should return: `{"status":"healthy",...}`

### 2. Main Page
Visit: http://localhost:3000
Should show the Memory Garden homepage

### 3. Plant Page
Visit: http://localhost:3000/plant
Should show the memory planting form

## 🔧 Development Workflow

### Quick Start (Recommended)
```bash
./scripts/dev-setup.sh
```

### Manual Start
```bash
# 1. Clean up
rm -rf .next

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Start development server
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🌐 Deployment Status

### Ready for Vercel Deployment ✅
- ✅ Build passes: `npm run build`
- ✅ All API routes configured
- ✅ Database schema ready
- ✅ Environment variables documented

### Next Steps for Production
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Memory Garden v0.3 - Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables
   - Deploy!

3. **Set up services**:
   - Vercel Postgres (FREE database)
   - Cloudinary (FREE file storage)
   - Hugging Face (FREE AI generation)

## 📊 Environment Variables

### Required for Production
```env
DATABASE_URL=postgresql://... (from Vercel Postgres)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-project.vercel.app
```

### Optional (for full features)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
HUGGING_FACE_API_KEY=your-token
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🆘 Getting Help

### Check Logs
```bash
# Development logs
npm run dev

# Build logs
npm run build

# Vercel logs (after deployment)
vercel logs
```

### Common Error Messages

1. **"Module not found"**: Run `npm install`
2. **"Prisma client not generated"**: Run `npx prisma generate`
3. **"Environment variable missing"**: Check `.env.local`
4. **"Database connection failed"**: Check `DATABASE_URL`

### Useful Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if port 3000 is in use
lsof -i :3000

# Kill all Node processes
pkill -f node

# Clean everything and restart
rm -rf .next node_modules package-lock.json
npm install
npx prisma generate
npm run dev
```

## 🎉 Success Indicators

✅ **Local Development**: http://localhost:3000 loads without errors
✅ **API Health**: http://localhost:3000/api/health returns success
✅ **Build Success**: `npm run build` completes without errors
✅ **Production Ready**: All environment variables documented

---

**Your Memory Garden is ready for deployment!** 🌱✨ 