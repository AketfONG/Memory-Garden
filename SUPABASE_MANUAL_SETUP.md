# 🗄️ Supabase Manual Database Setup

Since the Prisma connection is having issues with prepared statements, let's set up the database manually in Supabase.

## 📋 Step-by-Step Instructions:

### 1. Go to Supabase SQL Editor
1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **"New query"**

### 2. Run This SQL Script
Copy and paste this entire SQL script into the editor:

```sql
-- Memory Garden Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT,
    "email" TEXT UNIQUE,
    "emailVerified" TIMESTAMP,
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create Account table (for OAuth)
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE("provider", "providerAccountId")
);

-- Create Session table
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expires" TIMESTAMP NOT NULL,
    PRIMARY KEY ("identifier", "token")
);

-- Create Memory table
CREATE TABLE IF NOT EXISTS "Memory" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "vagueTime" TEXT,
    "categories" TEXT[] DEFAULT '{}',
    "emotions" TEXT[] DEFAULT '{}',
    "tags" TEXT[] DEFAULT '{}',
    "aiGeneratedContent" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "userId" TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create MediaFile table
CREATE TABLE IF NOT EXISTS "MediaFile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL CHECK ("type" IN ('IMAGE', 'VIDEO', 'AUDIO')),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "memoryId" TEXT NOT NULL,
    FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_memory_user_id" ON "Memory"("userId");
CREATE INDEX IF NOT EXISTS "idx_memory_created_at" ON "Memory"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_media_file_memory_id" ON "MediaFile"("memoryId");

-- Insert a test user (optional)
INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt") 
VALUES (
    'test-user-1',
    'Test User',
    'test@example.com',
    'hashed_password_here',
    NOW(),
    NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Insert a test memory (optional)
INSERT INTO "Memory" ("id", "title", "description", "userId", "createdAt", "updatedAt")
VALUES (
    'test-memory-1',
    'Welcome to Memory Garden',
    'This is your first memory in the garden. Plant more memories to watch your garden grow!',
    'test-user-1',
    NOW(),
    NOW()
) ON CONFLICT ("id") DO NOTHING;
```

### 3. Execute the Script
1. Click **"Run"** button
2. Wait for all queries to complete
3. You should see "Success. No rows returned" for each table creation

### 4. Verify Tables Created
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `User`
   - `Account`
   - `Session`
   - `VerificationToken`
   - `Memory`
   - `MediaFile`

### 5. Test Your Application
After running the SQL, test your database connection:

```bash
# Test the connection
node scripts/test-database.js
```

## 🎉 What This Creates:

- **User Table**: Store user accounts and profiles
- **Memory Table**: Store user memories with AI-generated content
- **MediaFile Table**: Handle images, videos, and audio files
- **Account & Session Tables**: For user authentication
- **VerificationToken Table**: For email verification
- **Indexes**: For better query performance

## 🚀 Next Steps:

1. **Run the SQL script** in Supabase SQL Editor
2. **Test the connection** with `node scripts/test-database.js`
3. **Deploy your application** to your hosting platform
4. **Set environment variables** in production

Your Memory Garden database will be ready! 🌱







