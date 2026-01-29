import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { initializeCounters } from '../utils/idGenerator';
import Company from '../models/Company';

dotenv.config();

async function migratePerCompanyCounters() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDatabase();

    // Get all companies
    const companies = await Company.find({ isDeleted: false });
    console.log(`📋 Found ${companies.length} companies`);

    // Initialize counters for each company
    for (const company of companies) {
      console.log(`\n📊 Initializing counters for company: ${company.name} (${company.companyId})`);
      await initializeCounters(company._id);
    }

    // Also initialize global counters (for SUPER_ADMIN users and any legacy data)
    console.log('\n📊 Initializing global counters (for SUPER_ADMIN users)...');
    await initializeCounters(undefined);

    console.log('\n🎉 Per-company counter migration completed successfully!');
    console.log('\n💡 Note:');
    console.log('   - Each company now has its own grievance/appointment/user counters');
    console.log('   - Counters start from 1 for each company');
    console.log('   - Existing data counters have been initialized based on current max values');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error during counter migration:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migratePerCompanyCounters();
}

export default migratePerCompanyCounters;
