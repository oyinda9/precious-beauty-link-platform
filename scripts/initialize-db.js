#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function initializeDatabase() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   SalonBook Database Initialization         ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable not set');
    process.exit(1);
  }

  console.log('📦 Connecting to database...\n');

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    // Connect to database
    await client.connect();
    console.log('✓ Connected to database');

    // Read and execute schema SQL
    console.log('\n📋 Creating schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    const schemaStatements = schemaSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of schemaStatements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.error(`Error executing statement: ${statement.substring(0, 50)}...`);
            console.error(error.message);
          }
        }
      }
    }
    
    console.log('✓ Schema created successfully');

    // Read and execute seed SQL
    console.log('\n🌱 Seeding demo data...');
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    
    const seedStatements = seedSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of seedStatements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (error) {
          console.error(`Error executing seed statement: ${statement.substring(0, 50)}...`);
          console.error(error.message);
        }
      }
    }
    
    console.log('✓ Demo data seeded successfully');

    console.log('\n✅ Database initialization complete!\n');
    console.log('📊 Demo Account:');
    console.log('   Email: admin@salon.com');
    console.log('   Password: password123\n');
    console.log('🚀 You can now run: pnpm dev\n');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error.message);
    
    try {
      await client.end();
    } catch (e) {
      // Ignore
    }
    
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
