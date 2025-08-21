const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🚀 Starting database cleanup...');
  
  try {
    // Start transaction
    await prisma.$transaction(async (tx) => {
      console.log('📊 Getting current user count...');
      const initialCount = await tx.user.count();
      console.log(`Initial user count: ${initialCount}`);
      
      // Get the users we want to keep
      const keepUsers = await tx.user.findMany({
        where: {
          email: {
            in: ['Tom@laware.se', 'thinh@laware.se', 'Momo@laware.se']
          }
        },
        select: { id: true, email: true, name: true }
      });
      
      console.log('👥 Users to keep:');
      keepUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
      });
      
      if (keepUsers.length !== 3) {
        throw new Error(`Expected 3 users to keep, found ${keepUsers.length}`);
      }
      
      const keepUserIds = keepUsers.map(u => u.id);
      
      // Delete related records first (to avoid foreign key constraints)
      console.log('🗑️  Deleting related records for users to be removed...');
      
      // Delete activities
      const deletedActivities = await tx.activity.deleteMany({
        where: {
          userId: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedActivities.count} activities`);
      
      // Delete time entries
      const deletedTimeEntries = await tx.timeEntry.deleteMany({
        where: {
          userId: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedTimeEntries.count} time entries`);
      
      // Delete comments
      const deletedComments = await tx.comment.deleteMany({
        where: {
          authorId: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedComments.count} comments`);
      
      // Delete legal references
      const deletedLegalRefs = await tx.legalReference.deleteMany({
        where: {
          addedById: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedLegalRefs.count} legal references`);
      
      // Delete legal statutes
      const deletedStatutes = await tx.legalStatute.deleteMany({
        where: {
          addedById: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedStatutes.count} legal statutes`);
      
      // Delete court decisions
      const deletedDecisions = await tx.courtDecision.deleteMany({
        where: {
          addedById: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedDecisions.count} court decisions`);
      
      // Update milestones to remove references to deleted users
      const updatedMilestones1 = await tx.milestone.updateMany({
        where: {
          completedById: { notIn: keepUserIds }
        },
        data: {
          completedById: null
        }
      });
      console.log(`  Updated ${updatedMilestones1.count} milestones (completedBy)`);
      
      const updatedMilestones2 = await tx.milestone.updateMany({
        where: {
          assignedToId: { notIn: keepUserIds }
        },
        data: {
          assignedToId: null
        }
      });
      console.log(`  Updated ${updatedMilestones2.count} milestones (assignedTo)`);
      
      // Update workflow steps to remove references to deleted users
      const updatedWorkflowSteps = await tx.workflowStep.updateMany({
        where: {
          assignedToId: { notIn: keepUserIds }
        },
        data: {
          assignedToId: null
        }
      });
      console.log(`  Updated ${updatedWorkflowSteps.count} workflow steps`);
      
      // Update cases to remove references to deleted users
      const updatedCases1 = await tx.case.updateMany({
        where: {
          assignedToId: { notIn: keepUserIds }
        },
        data: {
          assignedToId: null
        }
      });
      console.log(`  Updated ${updatedCases1.count} cases (assignedTo)`);
      
      const updatedCases2 = await tx.case.updateMany({
        where: {
          createdById: { notIn: keepUserIds }
        },
        data: {
          createdById: null
        }
      });
      console.log(`  Updated ${updatedCases2.count} cases (createdBy)`);
      
      // Delete sessions and accounts for users to be removed
      const deletedSessions = await tx.session.deleteMany({
        where: {
          userId: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedSessions.count} sessions`);
      
      const deletedAccounts = await tx.account.deleteMany({
        where: {
          userId: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedAccounts.count} accounts`);
      
      // Delete files uploaded by users to be removed
      const deletedFiles = await tx.file.deleteMany({
        where: {
          uploadedById: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedFiles.count} files`);
      
      // Now delete the unwanted users
      console.log('👤 Deleting unwanted users...');
      const deletedUsers = await tx.user.deleteMany({
        where: {
          id: { notIn: keepUserIds }
        }
      });
      console.log(`  Deleted ${deletedUsers.count} users`);
      
      // Update roles for the remaining users
      console.log('🔄 Updating user roles...');
      
      // Tom -> Associate
      await tx.user.update({
        where: { email: 'Tom@laware.se' },
        data: { role: 'ASSOCIATE' }
      });
      console.log('  ✅ Tom updated to Associate');
      
      // Thinh -> Lawyer
      await tx.user.update({
        where: { email: 'thinh@laware.se' },
        data: { role: 'LAWYER' }
      });
      console.log('  ✅ Thinh updated to Lawyer');
      
      // Momo -> Associate
      await tx.user.update({
        where: { email: 'Momo@laware.se' },
        data: { role: 'ASSOCIATE' }
      });
      console.log('  ✅ Momo updated to Associate');
      
      // Final count
      const finalCount = await tx.user.count();
      console.log(`\n📊 Final user count: ${finalCount}`);
      
      // Verify the remaining users
      const remainingUsers = await tx.user.findMany({
        select: { name: true, email: true, role: true }
      });
      
      console.log('\n👥 Remaining users:');
      remainingUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    });
    
    console.log('\n✅ Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('🎉 Cleanup script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup script failed:', error);
    process.exit(1);
  });
