/**
 * Fix Phone Number ID Script
 * 
 * Updates company's WhatsApp phone number ID to match environment variable.
 * This fixes the mismatch between metadata and database configuration.
 * 
 * Run: ts-node src/scripts/fixPhoneNumberId.ts
 */

require('dotenv').config();
import mongoose from 'mongoose';
import Company from '../models/Company';
import { connectDatabase } from '../config/database';

async function fixPhoneNumberId() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connected\n');

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!phoneNumberId) {
      console.error('❌ WHATSAPP_PHONE_NUMBER_ID not set in .env');
      process.exit(1);
    }

    if (!accessToken) {
      console.error('❌ WHATSAPP_ACCESS_TOKEN not set in .env');
      process.exit(1);
    }

    console.log('📋 Updating companies with phone number ID:', phoneNumberId);
    console.log('   Access Token:', accessToken ? '***SET***' : 'NOT SET');
    console.log('   Business Account ID:', businessAccountId || 'NOT SET');
    console.log('');

    // Find all active companies
    const companies = await Company.find({ isActive: true, isDeleted: false });

    if (companies.length === 0) {
      console.log('⚠️ No active companies found');
      process.exit(0);
    }

    console.log(`Found ${companies.length} active company(ies)\n`);

    for (const company of companies) {
      console.log(`📝 Updating: ${company.name} (${company.companyId})`);
      
      // Get current phone number ID for comparison
      const oldPhoneId = company.whatsappConfig?.phoneNumberId;
      
      // Use updateOne to update only whatsappConfig field
      // This avoids validation errors on other fields (like invalid enum values)
      const updateData: any = {
        'whatsappConfig.phoneNumberId': phoneNumberId,
        'whatsappConfig.accessToken': accessToken
      };
      
      if (businessAccountId) {
        updateData['whatsappConfig.businessAccountId'] = businessAccountId;
      }
      
      // Update using updateOne to bypass validation on other fields
      const result = await Company.updateOne(
        { _id: company._id },
        { $set: updateData }
      );
      
      if (result.modifiedCount > 0) {
        if (oldPhoneId && oldPhoneId !== phoneNumberId) {
          console.log(`   🔄 Updated phone number ID: ${oldPhoneId} → ${phoneNumberId}`);
        } else if (!oldPhoneId) {
          console.log(`   ✅ Created WhatsApp config with phone number ID: ${phoneNumberId}`);
        } else {
          console.log(`   ✅ Phone number ID already correct: ${phoneNumberId}`);
        }
        console.log('   ✅ Updated access token');
        console.log(`   ✅ Company updated successfully!\n`);
      } else {
        console.log('   ⚠️ No changes made (already up to date)\n');
      }
    }

    console.log('='.repeat(80));
    console.log('✅ All companies updated successfully!');
    console.log('='.repeat(80));
    console.log('\n📱 Next steps:');
    console.log('   1. Restart your server');
    console.log('   2. Send "Hi" to your WhatsApp Business number');
    console.log('   3. Check terminal logs for any errors');
    console.log('   4. You should now receive responses!');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixPhoneNumberId();
