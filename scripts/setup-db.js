const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Setting up Memory Garden database...');

  // Create a test user if it doesn't exist
  const testUser = await prisma.user.upsert({
    where: { email: 'test@memorygarden.com' },
    update: {},
    create: {
      email: 'test@memorygarden.com',
      name: 'Test User',
      password: await bcrypt.hash('password123', 10),
    },
  });

  console.log('✅ Test user created:', testUser.email);

  // Create some sample memories
  const sampleMemories = [
    {
      title: 'Sunset at the Beach',
      description: 'Watched the most beautiful sunset with family. The sky was painted in shades of orange and pink. The sound of waves was so peaceful.',
      startDate: new Date('2024-12-15T18:30:00Z'),
      categories: ['Family', 'Nature'],
      emotions: ['Peaceful', 'Happy'],
      tags: ['sunset', 'beach', 'family', 'peaceful'],
      userId: testUser.id,
    },
    {
      title: 'Coffee with Old Friends',
      description: 'Reconnected with high school friends over coffee. We laughed about old memories and caught up on our lives. Time flew by so quickly.',
      startDate: new Date('2024-11-20T14:00:00Z'),
      categories: ['Friends'],
      emotions: ['Happy', 'Grateful'],
      tags: ['coffee', 'friends', 'reunion', 'laughter'],
      userId: testUser.id,
    },
    {
      title: 'Hiking Adventure',
      description: 'Hiked to the mountain peak and the view was absolutely breathtaking. The fresh air and sense of accomplishment were incredible.',
      startDate: new Date('2024-10-12T08:00:00Z'),
      endDate: new Date('2024-10-14T18:00:00Z'),
      categories: ['Nature', 'Achievement'],
      emotions: ['Proud', 'Excited'],
      tags: ['hiking', 'mountain', 'adventure', 'nature'],
      userId: testUser.id,
    },
  ];

  for (const memoryData of sampleMemories) {
    const memory = await prisma.memory.create({
      data: memoryData,
    });
    console.log('✅ Sample memory created:', memory.title);
  }

  console.log('🎉 Database setup completed successfully!');
  console.log('📧 Test user email: test@memorygarden.com');
  console.log('🔑 Test user password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Database setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 