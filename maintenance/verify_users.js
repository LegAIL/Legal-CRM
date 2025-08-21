const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyUsers() {
  console.log('🔍 Verifying user authentication and roles...');
  
  try {
    // Get all remaining users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
        active: true,
        position: true
      }
    });
    
    console.log(`\n📊 Found ${users.length} users in database:`);
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Role: ${user.role}`);
      console.log(`   💼 Position: ${user.position || 'Not set'}`);
      console.log(`   ✅ Active: ${user.active}`);
      console.log(`   🔐 Has Password: ${user.password ? 'Yes' : 'No'}`);
      
      // Check if password exists and is hashed
      if (user.password) {
        const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        console.log(`   🔒 Password Format: ${isHashed ? 'Properly hashed' : 'Plain text or other format'}`);
      }
    }
    
    // Verify role assignments match requirements
    console.log('\n🎯 Role Verification:');
    const tomUser = users.find(u => u.email === 'Tom@laware.se');
    const thinhUser = users.find(u => u.email === 'thinh@laware.se');
    const momoUser = users.find(u => u.email === 'Momo@laware.se');
    
    console.log(`   Tom role: ${tomUser?.role} ${tomUser?.role === 'ASSOCIATE' ? '✅' : '❌'}`);
    console.log(`   Thinh role: ${thinhUser?.role} ${thinhUser?.role === 'LAWYER' ? '✅' : '❌'}`);
    console.log(`   Momo role: ${momoUser?.role} ${momoUser?.role === 'ASSOCIATE' ? '✅' : '❌'}`);
    
    // Check database integrity
    console.log('\n🔍 Database Integrity Check:');
    
    const caseCount = await prisma.case.count();
    const activityCount = await prisma.activity.count();
    const commentCount = await prisma.comment.count();
    const timeEntryCount = await prisma.timeEntry.count();
    const fileCount = await prisma.file.count();
    
    console.log(`   Cases: ${caseCount}`);
    console.log(`   Activities: ${activityCount}`);
    console.log(`   Comments: ${commentCount}`);
    console.log(`   Time Entries: ${timeEntryCount}`);
    console.log(`   Files: ${fileCount}`);
    
    // Check for orphaned records
    const orphanedCases = await prisma.case.count({
      where: {
        OR: [
          { assignedToId: { not: null }, assignedTo: null },
          { createdById: { not: null }, createdBy: null }
        ]
      }
    });
    
    const orphanedActivities = await prisma.activity.count({
      where: {
        userId: { not: null },
        user: null
      }
    });
    
    console.log(`\n🔍 Orphaned Records Check:`);
    console.log(`   Orphaned Cases: ${orphanedCases} ${orphanedCases === 0 ? '✅' : '❌'}`);
    console.log(`   Orphaned Activities: ${orphanedActivities} ${orphanedActivities === 0 ? '✅' : '❌'}`);
    
    console.log('\n✅ User verification completed!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyUsers()
  .then(() => {
    console.log('🎉 Verification script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Verification script failed:', error);
    process.exit(1);
  });
