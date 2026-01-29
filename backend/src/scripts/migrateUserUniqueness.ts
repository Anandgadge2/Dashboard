/**
 * Migration Script: Update User Email/Phone Uniqueness
 * 
 * This script migrates the User model from global unique constraints
 * to company-scoped unique constraints, allowing the same email/phone
 * to be used across different companies, but not within the same company.
 * 
 * IMPORTANT: Run this script ONCE after deploying the updated User model.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';

dotenv.config();

async function migrateUserUniqueness() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDatabase();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const usersCollection = db.collection('users');

    console.log('📋 Checking existing indexes...');
    const existingIndexes = await usersCollection.indexes();
    console.log('Current indexes:', existingIndexes.map(idx => idx.name));

    // Drop old unique indexes if they exist
    try {
      console.log('🗑️ Dropping old unique indexes...');
      await usersCollection.dropIndex('email_1');
      console.log('✅ Dropped email_1 index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️ email_1 index does not exist, skipping');
      } else {
        console.warn('⚠️ Error dropping email_1 index:', error.message);
      }
    }

    try {
      await usersCollection.dropIndex('phone_1');
      console.log('✅ Dropped phone_1 index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️ phone_1 index does not exist, skipping');
      } else {
        console.warn('⚠️ Error dropping phone_1 index:', error.message);
      }
    }

    // Create new compound unique indexes
    console.log('📝 Creating new compound unique indexes...');
    
    try {
      // Compound unique index: email + companyId (sparse to allow null companyId for SUPER_ADMIN)
      await usersCollection.createIndex(
        { email: 1, companyId: 1 },
        { 
          unique: true, 
          sparse: true,
          name: 'email_1_companyId_1',
          background: true
        }
      );
      console.log('✅ Created compound unique index: email + companyId');
    } catch (error: any) {
      console.error('❌ Error creating email+companyId index:', error.message);
      if (error.code === 85) {
        console.warn('⚠️ Duplicate key error - there may be duplicate emails within the same company');
        console.warn('   Please resolve duplicates before running this migration');
      }
    }

    try {
      // Compound unique index: phone + companyId
      await usersCollection.createIndex(
        { phone: 1, companyId: 1 },
        { 
          unique: true,
          name: 'phone_1_companyId_1',
          background: true
        }
      );
      console.log('✅ Created compound unique index: phone + companyId');
    } catch (error: any) {
      console.error('❌ Error creating phone+companyId index:', error.message);
      if (error.code === 85) {
        console.warn('⚠️ Duplicate key error - there may be duplicate phones within the same company');
        console.warn('   Please resolve duplicates before running this migration');
      }
    }

    // Verify new indexes
    console.log('\n📋 Verifying new indexes...');
    const newIndexes = await usersCollection.indexes();
    const emailCompanyIndex = newIndexes.find(idx => idx.name === 'email_1_companyId_1');
    const phoneCompanyIndex = newIndexes.find(idx => idx.name === 'phone_1_companyId_1');

    if (emailCompanyIndex) {
      console.log('✅ email + companyId index verified:', emailCompanyIndex);
    } else {
      console.warn('⚠️ email + companyId index not found');
    }

    if (phoneCompanyIndex) {
      console.log('✅ phone + companyId index verified:', phoneCompanyIndex);
    } else {
      console.warn('⚠️ phone + companyId index not found');
    }

    console.log('\n📊 Final indexes:');
    newIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n💡 Note:');
    console.log('   - Same email/phone can now be used across different companies');
    console.log('   - Email/phone must still be unique within the same company');
    console.log('   - SUPER_ADMIN users (companyId = null) are treated as a separate group');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  migrateUserUniqueness();
}

export default migrateUserUniqueness;
