/**
 * Seed WhatsApp Configuration for Zilla Parishad Amaravati
 * 
 * This script creates or updates the WhatsApp configuration for ZP Amaravati
 * using environment variables or existing data.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CompanyWhatsAppConfig from '../models/CompanyWhatsAppConfig';
import Company from '../models/Company';
import User from '../models/User';
import { connectDatabase } from '../config/database';

dotenv.config();

/**
 * Seed WhatsApp Configuration for ZP Amaravati
 */
async function seedZPWhatsAppConfig() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDatabase();

    // Find ZP Amaravati company
    const company = await Company.findOne({ 
      $or: [
        { name: 'ZP Amaravati' },
        { companyId: 'CMP000001' }
      ]
    });

    if (!company) {
      console.error('❌ ZP Amaravati company not found!');
      console.log('💡 Please run seed:zpamaravati first to create the company.');
      process.exit(1);
    }

    console.log('✅ Found company:', company.name, `(${company.companyId})`);

    // Find a superadmin user for createdBy
    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!superAdmin) {
      console.error('❌ SuperAdmin user not found!');
      console.log('💡 Please run seed:superadmin first.');
      process.exit(1);
    }

    // ZP Amaravati specific WhatsApp configuration
    // These are the correct values for ZP Amaravati (CMP000001)
    const zpAmaravatiConfig = {
      phoneNumber: process.env.WHATSAPP_PHONE_NUMBER || '919860617828', // ZP Amaravati phone number
      displayPhoneNumber: process.env.WHATSAPP_DISPLAY_PHONE_NUMBER || '+91 98606 17828',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '944323278765424', // ZP Amaravati phone number ID
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1524099585333783', // ZP Amaravati business account ID
    };

    // Check if config already exists for this company (ZP Amaravati)
    let existingConfig = await CompanyWhatsAppConfig.findOne({ companyId: company._id });

    // Also check if there's a config with the correct phoneNumberId (might be linked to wrong company)
    const configWithCorrectPhoneId = await CompanyWhatsAppConfig.findOne({ 
      phoneNumberId: zpAmaravatiConfig.phoneNumberId 
    });

    if (configWithCorrectPhoneId && configWithCorrectPhoneId.companyId.toString() !== company._id.toString()) {
      console.log(`⚠️ Found config with correct phoneNumberId (${zpAmaravatiConfig.phoneNumberId}) but linked to different company.`);
      console.log(`   Updating that config to link to ZP Amaravati...`);
      configWithCorrectPhoneId.companyId = company._id;
      await configWithCorrectPhoneId.save();
      existingConfig = configWithCorrectPhoneId;
    }

    // Get WhatsApp config - ALWAYS use ZP Amaravati values (from env or defaults)
    // Don't use existingConfig values as they might be from another company
    const whatsappConfig = {
      companyId: company._id,
      phoneNumber: process.env.WHATSAPP_PHONE_NUMBER || zpAmaravatiConfig.phoneNumber,
      displayPhoneNumber: process.env.WHATSAPP_DISPLAY_PHONE_NUMBER || zpAmaravatiConfig.displayPhoneNumber,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || zpAmaravatiConfig.phoneNumberId,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || zpAmaravatiConfig.businessAccountId,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || existingConfig?.accessToken || '',
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || existingConfig?.verifyToken || 'your_webhook_verify_token',
      chatbotSettings: {
        isEnabled: true,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'hi', 'mr'],
        welcomeMessage: 'Welcome! How can we help you today?',
        businessHours: {
          enabled: false,
          timezone: 'Asia/Kolkata',
          schedule: []
        }
      },
      activeFlows: [],
      rateLimits: {
        messagesPerMinute: 60,
        messagesPerHour: 1000,
        messagesPerDay: 10000
      },
      stats: {
        totalMessagesSent: 0,
        totalMessagesReceived: 0,
        totalConversations: 0
      },
      isActive: true,
      isVerified: false,
      createdBy: superAdmin._id
    };

    if (existingConfig) {
      console.log('⚠️ WhatsApp config already exists for ZP Amaravati, updating with correct ZP Amaravati values...');
      
      // FORCE update all fields to ZP Amaravati values (don't keep wrong values from other companies)
      const oldPhoneNumberId = existingConfig.phoneNumberId;
      
      // Check if phoneNumberId needs to be changed (might be from another company like Jharsuguda)
      if (oldPhoneNumberId !== whatsappConfig.phoneNumberId) {
        console.log(`🔄 Updating phoneNumberId: ${oldPhoneNumberId} → ${whatsappConfig.phoneNumberId}`);
        
        // Check if the target phoneNumberId is already used by another company
        const conflictConfig = await CompanyWhatsAppConfig.findOne({ 
          phoneNumberId: whatsappConfig.phoneNumberId,
          _id: { $ne: existingConfig._id }
        });
        
        if (conflictConfig) {
          console.warn(`⚠️ Phone Number ID ${whatsappConfig.phoneNumberId} is already used by another company.`);
          console.warn(`   This might cause issues. Please check the database.`);
        }
      }
      
      // FORCE update all fields to ZP Amaravati values
      existingConfig.phoneNumber = whatsappConfig.phoneNumber;
      existingConfig.displayPhoneNumber = whatsappConfig.displayPhoneNumber;
      // Only update phoneNumberId if it's different (to avoid unique constraint errors)
      if (existingConfig.phoneNumberId !== whatsappConfig.phoneNumberId) {
        existingConfig.phoneNumberId = whatsappConfig.phoneNumberId;
      }
      existingConfig.businessAccountId = whatsappConfig.businessAccountId;
      
      // Update tokens only if provided in env or if missing
      if (process.env.WHATSAPP_ACCESS_TOKEN) {
        existingConfig.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      } else if (!existingConfig.accessToken) {
        existingConfig.accessToken = whatsappConfig.accessToken;
      }
      
      if (process.env.WHATSAPP_VERIFY_TOKEN) {
        existingConfig.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
      } else if (!existingConfig.verifyToken) {
        existingConfig.verifyToken = whatsappConfig.verifyToken;
      }
      
      // Update settings
      existingConfig.chatbotSettings = whatsappConfig.chatbotSettings;
      existingConfig.rateLimits = whatsappConfig.rateLimits;
      existingConfig.isActive = whatsappConfig.isActive;
      existingConfig.updatedBy = superAdmin._id;
      
      await existingConfig.save();
      console.log('✅ WhatsApp config updated successfully with ZP Amaravati values!');
      console.log('📋 Config ID:', existingConfig._id);
    } else {
      console.log('📝 Creating new WhatsApp config...');
      
      // Create new config
      const config = await CompanyWhatsAppConfig.create(whatsappConfig);
      console.log('✅ WhatsApp config created successfully!');
      console.log('📋 Config ID:', config._id);
    }

    console.log('\n📊 Configuration Details:');
    console.log('   Phone Number:', whatsappConfig.phoneNumber);
    console.log('   Display Phone:', whatsappConfig.displayPhoneNumber);
    console.log('   Phone Number ID:', whatsappConfig.phoneNumberId);
    console.log('   Business Account ID:', whatsappConfig.businessAccountId);
    console.log('   Access Token:', whatsappConfig.accessToken ? '***' + whatsappConfig.accessToken.slice(-4) : 'Not set');
    console.log('   Verify Token:', whatsappConfig.verifyToken ? '***' + whatsappConfig.verifyToken.slice(-4) : 'Not set');
    console.log('   Status:', whatsappConfig.isActive ? 'Active' : 'Inactive');

    console.log('\n🎉 WhatsApp configuration seeding completed!');
    console.log('\n💡 Note: If access token is empty, please update it from the UI or environment variables.');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding WhatsApp config:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  seedZPWhatsAppConfig();
}

export default seedZPWhatsAppConfig;
