/**
 * Prisma Seed Script
 * 
 * This script creates the initial ADMIN user(s) and professions for the application.
 * SECURITY: ADMIN role can ONLY be created through this seed script,
 * never through public API endpoints.
 * 
 * Usage:
 *   npx prisma db seed
 *   or
 *   npm run prisma:seed
 * 
 * Prerequisites:
 *   - Database must be running
 *   - DATABASE_URL must be set in .env
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Admin user configuration
 * IMPORTANT: Change these values in production!
 */
const ADMIN_CONFIG = {
  email: 'admin@samaouvrier.com',
  // In production, use environment variables or secure secret management
  // This is the default password - CHANGE IT IMMEDIATELY AFTER FIRST LOGIN
  password: 'Admin@2024!Secure',
  nom: 'Admin',
  prenom: 'Super',
  adresse: 'Admin HQ',
  tel: '+221000000000',
};

/**
 * Professions to seed
 */
const PROFESSIONS = [
  { name: 'Plumber', description: 'Professional plumber for pipe repairs and installations' },
  { name: 'Electrician', description: 'Licensed electrician for electrical work' },
  { name: 'Carpenter', description: 'Skilled carpenter for woodwork and furniture' },
  { name: 'Painter', description: 'Professional painter for interior and exterior painting' },
  { name: 'Mason', description: 'Expert mason for construction and repairs' },
  { name: 'Welder', description: 'Professional welder for metal work' },
  { name: 'Gardener', description: 'Landscaping and garden maintenance specialist' },
  { name: 'Cleaner', description: 'Professional cleaning services for homes and offices' },
  { name: 'Mechanic', description: 'Vehicle mechanic for car repairs and maintenance' },
  { name: 'AC Technician', description: 'Air conditioning installation and repair specialist' },
];

async function main(): Promise<void> {
  console.log('🌱 Starting Prisma seed...\n');

  // Hash password for admin
  const adminPasswordHash = await bcrypt.hash(ADMIN_CONFIG.password, 12);

  // ============================================
  // Create or Update ADMIN user (using upsert)
  // ============================================
  console.log('🔐 Creating ADMIN user...');

  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_CONFIG.email },
    update: {
      // Update password if it changed, keep other fields
      password: adminPasswordHash,
      nom: ADMIN_CONFIG.nom,
      prenom: ADMIN_CONFIG.prenom,
      adresse: ADMIN_CONFIG.adresse,
      tel: ADMIN_CONFIG.tel,
    },
    create: {
      email: ADMIN_CONFIG.email,
      password: adminPasswordHash,
      nom: ADMIN_CONFIG.nom,
      prenom: ADMIN_CONFIG.prenom,
      adresse: ADMIN_CONFIG.adresse,
      tel: ADMIN_CONFIG.tel,
      role: Role.ADMIN, // Only seed can create ADMIN users
    },
  });

  console.log(`✅ Admin user created/updated: ${adminUser.email} (${adminUser.role})`);

  // ============================================
  // Create Professions
  // ============================================
  console.log('\n📋 Creating professions...');

  for (const profession of PROFESSIONS) {
    await prisma.profession.upsert({
      where: { name: profession.name },
      update: {
        description: profession.description,
      },
      create: {
        name: profession.name,
        description: profession.description,
      },
    });
    console.log(`   ✅ Profession: ${profession.name}`);
  }

  // ============================================
  // Summary
  // ============================================
  console.log('\n📊 Seed Summary:');
  console.log('─'.repeat(40));
  console.log(`| ADMIN Email: ${ADMIN_CONFIG.email.padEnd(20)} |`);
  console.log(`| ADMIN Role:  ${'ADMIN'.padEnd(20)} |`);
  console.log(`| Professions:  ${PROFESSIONS.length.toString().padEnd(20)} |`);
  console.log('─'.repeat(40));
  console.log('\n⚠️  SECURITY WARNING:');
  console.log('   Change admin password immediately after first login!');
  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('\n❌ Seed failed with error:', error);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect Prisma client
    await prisma.$disconnect();
  });
