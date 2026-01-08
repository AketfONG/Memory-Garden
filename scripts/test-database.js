#!/usr/bin/env node
/**
 * Database Test Script for Memory Garden
 * This script tests database connectivity and basic operations
 */

const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  console.log('🧪 Memory Garden Database Test');
  console.log('==============================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    console.log('Please set your database URL:');
    console.log('export DATABASE_URL="postgresql://user:password@host:port/database"');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Test basic operations
    console.log('📊 Testing database operations...');
    
    // Check if we can query the database
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    const memoryCount = await prisma.memory.count();
    console.log(`🌱 Memories in database: ${memoryCount}`);
    
    const mediaCount = await prisma.mediaFile.count();
    console.log(`📁 Media files in database: ${mediaCount}`);

    // Test creating a test user (if none exist)
    if (userCount === 0) {
      console.log('\n🔧 Creating test user...');
      const testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed_password_here'
        }
      });
      console.log(`✅ Test user created with ID: ${testUser.id}`);
      
      // Create a test memory
      console.log('🌱 Creating test memory...');
      const testMemory = await prisma.memory.create({
        data: {
          title: 'Test Memory',
          description: 'This is a test memory to verify database functionality.',
          userId: testUser.id,
          categories: ['test'],
          emotions: ['curious'],
          tags: ['database-test']
        }
      });
      console.log(`✅ Test memory created with ID: ${testMemory.id}`);
      
      // Clean up test data
      console.log('🧹 Cleaning up test data...');
      await prisma.memory.delete({ where: { id: testMemory.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 Database test completed successfully!');
    console.log('\nYour database is ready for Memory Garden! 🌱');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your DATABASE_URL is correct');
      console.log('2. Ensure your database server is running');
      console.log('3. Verify network connectivity');
    } else if (error.code === 'P1002') {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your database credentials');
      console.log('2. Ensure the database exists');
      console.log('3. Verify user permissions');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabase().catch(console.error);







