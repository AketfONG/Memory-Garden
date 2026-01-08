# 🗄️ Database Setup Guide for Memory Garden

This guide will help you set up a production database for your Memory Garden application.

## 🚀 Quick Start

### Option 1: Supabase (Recommended)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free
   - Create a new project

2. **Get Database URL**
   - Go to Settings → Database
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your database password

3. **Update Environment**
   ```bash
   # Copy the production template
   cp .env.production.example .env.production
   
   # Edit with your database URL
   nano .env.production
   ```

4. **Setup Database**
   ```bash
   # Set your database URL
   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   
   # Run the setup script
   npm run db:setup
   ```

### Option 2: Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Create a new project

2. **Add PostgreSQL Service**
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the connection string

3. **Setup Database**
   ```bash
   export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway"
   npm run db:setup
   ```

### Option 3: Neon

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for free
   - Create a new project

2. **Get Connection String**
   - Copy the connection string from dashboard
   - It includes your password

3. **Setup Database**
   ```bash
   export DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
   npm run db:setup
   ```

## 📊 Database Schema

Your database includes these tables:

- **User** - User accounts and profiles
- **Memory** - User memories with AI-generated content
- **MediaFile** - Images, videos, and audio files
- **Account** - OAuth account connections
- **Session** - User sessions
- **VerificationToken** - Email verification tokens

## 🔧 Available Commands

```bash
# Setup database (first time)
npm run db:setup

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Open database studio
npm run db:studio
```

## 🌐 Deployment

### Vercel Deployment

1. **Set Environment Variables**
   - Go to your Vercel project settings
   - Add all variables from `.env.production.example`
   - Set `DATABASE_URL` to your production database

2. **Deploy**
   ```bash
   vercel --prod
   ```

### Netlify Deployment

1. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add all production variables

2. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check your DATABASE_URL format
   - Ensure database is accessible from your IP
   - Verify credentials are correct

2. **Schema Errors**
   - Run `npm run db:generate` first
   - Then run `npm run db:push`

3. **Permission Denied**
   - Check database user permissions
   - Ensure user can create tables

### Testing Database Connection

```bash
# Test connection
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ Database connected!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
"
```

## 📈 Monitoring

### Supabase Dashboard
- Monitor database usage
- View query performance
- Check connection limits

### Prisma Studio
```bash
npm run db:studio
```
- Visual database browser
- Edit data directly
- View relationships

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong database passwords
   - Rotate keys regularly

2. **Database Access**
   - Use connection pooling
   - Limit database user permissions
   - Enable SSL connections

3. **Backup Strategy**
   - Enable automatic backups
   - Test restore procedures
   - Store backups securely

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review your database provider's documentation
3. Check the Prisma documentation
4. Open an issue in the repository

---

**Happy Gardening! 🌱**







