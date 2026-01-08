#!/usr/bin/env node
/**
 * Database Connection Test Script
 * This script helps diagnose connection issues
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Memory Garden Database Connection Test');
  console.log('==========================================\n');

  // Test different connection string formats
  const connectionStrings = [
    {
      name: 'Standard with SSL',
      url: 'postgresql://postgres:Akee0710@db.uzinpgspbogksbqdgujb.supabase.co:5432/postgres?sslmode=require'
    },
    {
      name: 'With connection timeout',
      url: 'postgresql://postgres:Akee0710@db.uzinpgspbogksbqdgujb.supabase.co:5432/postgres?sslmode=require&connect_timeout=60'
    },
    {
      name: 'With pooler',
      url: 'postgresql://postgres:Akee0710@db.uzinpgspbogksbqdgujb.supabase.co:6543/postgres?sslmode=require'
    }
  ];

  for (const config of connectionStrings) {
    console.log(`🧪 Testing: ${config.name}`);
    console.log(`URL: ${config.url.replace('Akee0710', '***')}`);
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: config.url
          }
        }
      });
      
      await prisma.$connect();
      console.log('✅ Connection successful!\n');
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Query test successful!');
      
      await prisma.$disconnect();
      return config.url; // Return the working URL
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log('❌ All connection attempts failed.');
  console.log('\n💡 Troubleshooting suggestions:');
  console.log('1. Check if your Supabase project is active (not paused)');
  console.log('2. Verify the hostname in your Supabase dashboard');
  console.log('3. Check if your IP is whitelisted (if using IP restrictions)');
  console.log('4. Try using the pooler port (6543) instead of direct (5432)');
  
  return null;
}

// Run the test
testConnection().then(workingUrl => {
  if (workingUrl) {
    console.log(`\n🎉 Working connection string: ${workingUrl.replace('Akee0710', '***')}`);
    console.log('\nNext steps:');
    console.log('1. Set this as your DATABASE_URL');
    console.log('2. Run: npm run db:setup');
  }
}).catch(console.error);







