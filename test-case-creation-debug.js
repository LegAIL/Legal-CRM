
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCaseCreation() {
  try {
    console.log('Testing case creation with minimal data...')
    
    // First, let's get a test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'john@doe.com' }
    })
    
    if (!testUser) {
      console.log('Test user not found. Creating one...')
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('johndoe123', 12)
      
      const newUser = await prisma.user.create({
        data: {
          name: 'John Doe',
          email: 'john@doe.com',
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          role: 'LAWYER'
        }
      })
      console.log('Created test user:', newUser.email)
    } else {
      console.log('Found test user:', testUser.email)
    }
    
    // Test 1: Create case with minimal data (only title)
    console.log('\n--- Test 1: Minimal data (title only) ---')
    try {
      const minimalCase = await prisma.case.create({
        data: {
          title: 'Test Case - Minimal',
          createdById: testUser.id,
        }
      })
      console.log('✅ SUCCESS: Case created with minimal data:', minimalCase.id)
    } catch (error) {
      console.log('❌ FAILED: Minimal case creation:', error.message)
    }

    // Test 2: Create case with null values that might be causing issues
    console.log('\n--- Test 2: With explicitly null values ---')
    try {
      const nullCase = await prisma.case.create({
        data: {
          title: 'Test Case - With Nulls',
          description: null,
          clientName: null,
          clientEmail: null,
          clientPhone: null,
          assignedToId: null,
          dueDate: null,
          tags: [],
          notes: null,
          estimatedHours: null,
          hourlyRate: null,
          createdById: testUser.id,
        }
      })
      console.log('✅ SUCCESS: Case created with null values:', nullCase.id)
    } catch (error) {
      console.log('❌ FAILED: Case with null values:', error.message)
    }

    // Test 3: Create case with related data (as the API does)
    console.log('\n--- Test 3: With related data (milestones, etc.) ---')
    try {
      const complexCase = await prisma.case.create({
        data: {
          title: 'Test Case - Complex',
          description: 'Test description',
          createdById: testUser.id,
          milestones: {
            create: [
              {
                title: 'Test Milestone',
                description: 'Test milestone description',
                order: 1
              }
            ]
          },
          legalStatutes: {
            create: [
              {
                title: 'Test Statute',
                priority: 'MEDIUM',
                addedById: testUser.id
              }
            ]
          }
        }
      })
      console.log('✅ SUCCESS: Complex case created:', complexCase.id)
    } catch (error) {
      console.log('❌ FAILED: Complex case creation:', error.message)
    }

  } catch (error) {
    console.error('Main test error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCaseCreation()
