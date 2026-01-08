#!/usr/bin/env node
/**
 * Database Migration Script for Memory Garden
 * This script handles database migrations and schema updates
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function migrateDatabase() {
  console.log('🔄 Memory Garden Database Migration');
  console.log('===================================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    console.log('📊 Running Prisma migrations...');
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push schema changes
    console.log('📋 Pushing schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Migration complete!\n');

    // Verify tables exist
    console.log('🔍 Verifying database structure...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    const expectedTables = ['Account', 'Session', 'User', 'VerificationToken', 'Memory', 'MediaFile'];
    const existingTables = tables.map(t => t.table_name);
    
    console.log('📋 Database tables:');
    expectedTables.forEach(table => {
      const exists = existingTables.includes(table.toLowerCase());
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    });

    // Check for any missing tables
    const missingTables = expectedTables.filter(table => 
      !existingTables.includes(table.toLowerCase())
    );
    
    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log('Run the setup script first: node scripts/setup-database.js');
    } else {
      console.log('\n🎉 All tables are present and ready!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateDatabase().catch(console.error);







