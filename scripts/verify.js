#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 SalonBook Environment Verification\n');

const checks = [];

// Check 1: .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
const envExists = fs.existsSync(envPath);
checks.push({
  name: '.env.local file exists',
  passed: envExists,
  help: 'Create .env.local by running: cp .env.example .env.local'
});

// Check 2: DATABASE_URL is set
let dbUrl = '';
if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const dbMatch = envContent.match(/DATABASE_URL=["']?([^"'\n]+)/);
  dbUrl = dbMatch ? dbMatch[1] : '';
}
checks.push({
  name: 'DATABASE_URL is configured',
  passed: !!dbUrl && dbUrl !== 'postgresql://user:password@localhost:5432/salonbook',
  help: 'Set DATABASE_URL to your PostgreSQL connection string in .env.local'
});

// Check 3: JWT_SECRET is set
let jwtSecret = '';
if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const jwtMatch = envContent.match(/JWT_SECRET=["']?([^"'\n]+)/);
  jwtSecret = jwtMatch ? jwtMatch[1] : '';
}
checks.push({
  name: 'JWT_SECRET is configured',
  passed: !!jwtSecret && jwtSecret.length >= 16,
  help: 'Set JWT_SECRET to a random string (minimum 16 characters) in .env.local'
});

// Check 4: node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
checks.push({
  name: 'Dependencies installed (node_modules)',
  passed: fs.existsSync(nodeModulesPath),
  help: 'Run: pnpm install'
});

// Check 5: Prisma schema exists
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
checks.push({
  name: 'Prisma schema exists',
  passed: fs.existsSync(schemaPath),
  help: 'Prisma schema should be at prisma/schema.prisma'
});

// Print results
console.log('Verification Results:');
console.log('='.repeat(50));

let allPassed = true;
checks.forEach((check) => {
  const icon = check.passed ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
  if (!check.passed) {
    console.log(`   ℹ️  ${check.help}`);
    allPassed = false;
  }
});

console.log('='.repeat(50));

if (allPassed) {
  console.log('\n✨ All checks passed! You can now run:');
  console.log('   pnpm db:push');
  console.log('   pnpm db:seed');
  console.log('   pnpm dev\n');
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above.\n');
  process.exit(1);
}
