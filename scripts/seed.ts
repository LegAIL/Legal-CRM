
import { PrismaClient, UserRole, CaseStatus, CasePriority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users
  const adminPassword = await bcrypt.hash('johndoe123', 10)
  const userPassword = await bcrypt.hash('password123', 10)

  // Test admin account (hidden from user)
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: adminPassword,
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      role: UserRole.ADMINISTRATOR,
      position: 'Managing Partner',
      active: true,
    },
  })

  // LawAware admin accounts
  const thinhAdmin = await prisma.user.upsert({
    where: { email: 'thinh@laware.se' },
    update: {},
    create: {
      email: 'thinh@laware.se',
      password: userPassword,
      firstName: 'Thinh',
      lastName: 'Admin',
      name: 'Thinh Admin',
      role: UserRole.ADMINISTRATOR,
      position: 'Managing Partner',
      active: true,
    },
  })

  const tomAdmin = await prisma.user.upsert({
    where: { email: 'Tom@laware.se' },
    update: {},
    create: {
      email: 'Tom@laware.se',
      password: userPassword,
      firstName: 'Tom',
      lastName: 'Admin',
      name: 'Tom Admin',
      role: UserRole.ADMINISTRATOR,
      position: 'Senior Partner',
      active: true,
    },
  })

  const momoAdmin = await prisma.user.upsert({
    where: { email: 'Momo@laware.se' },
    update: {},
    create: {
      email: 'Momo@laware.se',
      password: userPassword,
      firstName: 'Momo',
      lastName: 'Admin',
      name: 'Momo Admin',
      role: UserRole.ADMINISTRATOR,
      position: 'Legal Administrator',
      active: true,
    },
  })

  // Additional users
  const user1 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@lawfirm.com' },
    update: {},
    create: {
      email: 'sarah.johnson@lawfirm.com',
      password: userPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      name: 'Sarah Johnson',
      role: UserRole.USER,
      position: 'Senior Attorney',
      phone: '+1-555-0123',
      active: true,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'michael.chen@lawfirm.com' },
    update: {},
    create: {
      email: 'michael.chen@lawfirm.com',
      password: userPassword,
      firstName: 'Michael',
      lastName: 'Chen',
      name: 'Michael Chen',
      role: UserRole.USER,
      position: 'Associate Attorney',
      phone: '+1-555-0124',
      active: true,
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'emily.davis@lawfirm.com' },
    update: {},
    create: {
      email: 'emily.davis@lawfirm.com',
      password: userPassword,
      firstName: 'Emily',
      lastName: 'Davis',
      name: 'Emily Davis',
      role: UserRole.ADMINISTRATOR,
      position: 'Legal Administrator',
      phone: '+1-555-0125',
      active: true,
    },
  })

  console.log('✅ Users created')

  // No sample cases created - user will create their own cases
  console.log('✅ No sample cases created - users will create their own')

  console.log('✅ Legal references created')

  console.log('🎉 Database seeding completed!')
  console.log(`📊 Created:`)
  console.log(`   - ${await prisma.user.count()} users`)
  console.log(`   - ${await prisma.case.count()} cases`)
  console.log(`   - ${await prisma.activity.count()} activities`)
  console.log(`   - ${await prisma.milestone.count()} milestones`)
  console.log(`   - ${await prisma.comment.count()} comments`)
  console.log(`   - ${await prisma.timeEntry.count()} time entries`)
  console.log(`   - ${await prisma.legalReference.count()} legal references`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
