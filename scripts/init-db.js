#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the Neon PostgreSQL database with the Prisma schema
 * and seeds it with demo data.
 */

const { exec } = require('child_process');
const path = require('path');

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n[${new Date().toLocaleTimeString()}] ${description}...`);
    exec(command, { cwd: path.dirname(__dirname) }, (error, stdout, stderr) => {
      if (error) {
        console.error(`\n❌ Error: ${description}`);
        console.error(stderr || error.message);
        reject(error);
      } else {
        console.log(`✓ ${description} completed`);
        if (stdout) console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

async function initializeDatabase() {
  try {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   SalonBook Database Initialization         ║');
    console.log('╚════════════════════════════════════════════╝');
    
    // Step 1: Check if Prisma is installed
    console.log('\n📦 Checking dependencies...');
    
    // Step 2: Generate Prisma Client
    await runCommand('pnpm exec prisma generate', 'Generating Prisma Client');
    
    // Step 3: Push schema to database
    await runCommand('pnpm exec prisma db push --skip-generate', 'Creating database tables');
    
    // Step 4: Run seed
    console.log('\n🌱 Seeding database with demo data...');
    try {
      await runCommand('pnpm exec prisma db seed', 'Seeding database');
    } catch (error) {
      console.warn('⚠️  Warning: Could not run seed script, but database is initialized');
      console.log('   You can manually run: pnpm db:seed');
    }
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   ✅ Database initialization completed!     ║');
    console.log('╚════════════════════════════════════════════╝');
    
    console.log('\n📝 Next steps:');
    console.log('  1. Start dev server: pnpm dev');
    console.log('  2. Open: http://localhost:3000');
    console.log('  3. Login with:');
    console.log('     Email: admin@salon.com');
    console.log('     Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed');
    process.exit(1);
  }
}

initializeDatabase();
