#!/usr/bin/env node
/**
 * Create Database Tables Script
 * This script creates the necessary tables for Memory Garden
 */

const { PrismaClient } = require('@prisma/client');

async function createTables() {
  console.log('🌱 Memory Garden - Creating Database Tables');
  console.log('===========================================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    console.log('📊 Creating database tables...');
    
    // Create User table
    console.log('👥 Creating User table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "name" TEXT,
        "email" TEXT UNIQUE,
        "emailVerified" TIMESTAMP,
        "image" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ User table created');

    // Create Account table
    console.log('🔐 Creating Account table...');
    await prisma.$executeRaw`
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
      )
    `;
    console.log('✅ Account table created');

    // Create Session table
    console.log('🔑 Creating Session table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "sessionToken" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `;
    console.log('✅ Session table created');

    // Create VerificationToken table
    console.log('✉️ Creating VerificationToken table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT UNIQUE NOT NULL,
        "expires" TIMESTAMP NOT NULL,
        PRIMARY KEY ("identifier", "token")
      )
    `;
    console.log('✅ VerificationToken table created');

    // Create Memory table
    console.log('🌱 Creating Memory table...');
    await prisma.$executeRaw`
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
      )
    `;
    console.log('✅ Memory table created');

    // Create MediaFile table
    console.log('📁 Creating MediaFile table...');
    await prisma.$executeRaw`
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
      )
    `;
    console.log('✅ MediaFile table created');

    // Create indexes
    console.log('📊 Creating indexes...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_memory_user_id" ON "Memory"("userId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_memory_created_at" ON "Memory"("createdAt")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_media_file_memory_id" ON "MediaFile"("memoryId")`;
    console.log('✅ Indexes created');

    console.log('\n🎉 All tables created successfully!');
    console.log('\nYour Memory Garden database is ready! 🌱');
    console.log('\nNext steps:');
    console.log('1. Test the database: node scripts/test-database.js');
    console.log('2. Deploy your application');
    console.log('3. Set DATABASE_URL in production environment');

  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTables().catch(console.error);







