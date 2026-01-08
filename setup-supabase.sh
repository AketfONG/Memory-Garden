#!/bin/bash

echo "🌱 Memory Garden Supabase Setup"
echo "==============================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set."
    echo ""
    echo "Please set your Supabase database URL:"
    echo "export DATABASE_URL=\"postgresql://postgres:[YOUR-PASSWORD]@db.uzinpgspbogksbqdgujb.supabase.co:5432/postgres\""
    echo ""
    echo "Replace [YOUR-PASSWORD] with your actual Supabase database password."
    echo ""
    echo "You can find your password in:"
    echo "1. Supabase Dashboard → Settings → Database"
    echo "2. Look for 'Database Password' section"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Test connection
echo "🔌 Testing database connection..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => {
  console.log('✅ Database connection successful!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
"

if [ $? -eq 0 ]; then
    echo ""
    echo "📊 Setting up database tables..."
    npm run db:setup
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Supabase database setup complete!"
        echo ""
        echo "Your Memory Garden is now connected to Supabase! 🌱"
        echo ""
        echo "Next steps:"
        echo "1. Deploy your application to your hosting platform"
        echo "2. Set the DATABASE_URL environment variable in production"
        echo "3. Run 'npm run db:migrate' after deployment"
    else
        echo "❌ Database setup failed. Please check your connection string."
    fi
else
    echo "❌ Database connection failed. Please check your DATABASE_URL."
fi







