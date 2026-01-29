/**
 * Fix WhatsApp Configuration for Zilla Parishad Amaravati
 * 
 * This script ensures ZP Amaravati has the correct WhatsApp configuration
 * by deleting any incorrect configs and creating/updating with correct values.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CompanyWhatsAppConfig from '../models/CompanyWhatsAppConfig';
import Company from '../models/Company';
import User from '../models/User';
import { connectDatabase } from '../config/database';

dotenv.config();

/**
 * Fix WhatsApp Configuration for ZP Amaravati
 */
async function fixZPWhatsAppConfig() {
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
      process.exit(1);
    }

    console.log('✅ Found company:', company.name, `(${company.companyId})`);

    // Find a superadmin user for createdBy
    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!superAdmin) {
      console.error('❌ SuperAdmin user not found!');
      process.exit(1);
    }

    // ZP Amaravati CORRECT WhatsApp configuration
    // FORCE these values for ZP Amaravati (CMP000001) regardless of environment variables
    // Environment variables might be set for other companies
    const correctConfig = {
      phoneNumber: '919860617828', // ZP Amaravati phone number
      displayPhoneNumber: '+91 98606 17828', // ZP Amaravati display phone
      phoneNumberId: '944323278765424', // ZP Amaravati phone number ID (NOT Jharsuguda's)
      businessAccountId: '1524099585333783', // ZP Amaravati business account ID
    };

    console.log('\n📋 Target Configuration:');
    console.log('   Phone Number:', correctConfig.phoneNumber);
    console.log('   Phone Number ID:', correctConfig.phoneNumberId);
    console.log('   Business Account ID:', correctConfig.businessAccountId);

    // Find existing config for ZP Amaravati
    const existingConfig = await CompanyWhatsAppConfig.findOne({ companyId: company._id });
    
    // Find config with correct phoneNumberId (might be linked to wrong company)
    const configWithCorrectPhoneId = await CompanyWhatsAppConfig.findOne({ 
      phoneNumberId: correctConfig.phoneNumberId 
    });

    let finalConfig;

    if (configWithCorrectPhoneId) {
      // If config with correct phoneNumberId exists, use it
      console.log('\n✅ Found config with correct phoneNumberId');
      
      if (configWithCorrectPhoneId.companyId.toString() === company._id.toString()) {
        console.log('   Config is already linked to ZP Amaravati. Updating values...');
        finalConfig = configWithCorrectPhoneId;
      } else {
        console.log('   Config is linked to different company. Re-linking to ZP Amaravati...');
        // Delete any existing config for ZP Amaravati
        if (existingConfig && existingConfig._id.toString() !== configWithCorrectPhoneId._id.toString()) {
          await CompanyWhatsAppConfig.deleteOne({ _id: existingConfig._id });
          console.log('   Deleted incorrect config for ZP Amaravati');
        }
        // Link correct config to ZP Amaravati
        configWithCorrectPhoneId.companyId = company._id;
        await configWithCorrectPhoneId.save();
        finalConfig = configWithCorrectPhoneId;
      }
    } else if (existingConfig) {
      // If existing config has wrong phoneNumberId, delete it
      console.log('\n⚠️ Existing config has wrong phoneNumberId. Deleting and creating new one...');
      await CompanyWhatsAppConfig.deleteOne({ _id: existingConfig._id });
      finalConfig = null;
    }

    // Update or create config with correct values
    const configData = {
      companyId: company._id,
      phoneNumber: correctConfig.phoneNumber,
      displayPhoneNumber: correctConfig.displayPhoneNumber,
      phoneNumberId: correctConfig.phoneNumberId,
      businessAccountId: correctConfig.businessAccountId,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || finalConfig?.accessToken || '',
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || finalConfig?.verifyToken || 'your_webhook_verify_token',
      chatbotSettings: {
        isEnabled: true,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'hi', 'mr'],
        welcomeMessage: 'Welcome to Zilla Parishad Amaravati! How can we help you today?',
        businessHours: {
          enabled: false,
          timezone: 'Asia/Kolkata',
          schedule: []
        }
      },
      activeFlows: finalConfig?.activeFlows || [],
      rateLimits: {
        messagesPerMinute: 60,
        messagesPerHour: 1000,
        messagesPerDay: 10000
      },
      stats: finalConfig?.stats || {
        totalMessagesSent: 0,
        totalMessagesReceived: 0,
        totalConversations: 0
      },
      isActive: true,
      isVerified: finalConfig?.isVerified || false,
      createdBy: superAdmin._id,
      updatedBy: superAdmin._id
    };

    if (finalConfig) {
      // Update existing config
      Object.assign(finalConfig, configData);
      await finalConfig.save();
      console.log('\n✅ WhatsApp config updated successfully!');
      console.log('📋 Config ID:', finalConfig._id);
    } else {
      // Create new config
      const newConfig = await CompanyWhatsAppConfig.create(configData);
      console.log('\n✅ WhatsApp config created successfully!');
      console.log('📋 Config ID:', newConfig._id);
      finalConfig = newConfig;
    }

    console.log('\n📊 Final Configuration:');
    console.log('   Phone Number:', finalConfig.phoneNumber);
    console.log('   Display Phone:', finalConfig.displayPhoneNumber);
    console.log('   Phone Number ID:', finalConfig.phoneNumberId);
    console.log('   Business Account ID:', finalConfig.businessAccountId);
    console.log('   Access Token:', finalConfig.accessToken ? '***' + finalConfig.accessToken.slice(-4) : 'Not set');
    console.log('   Status:', finalConfig.isActive ? 'Active' : 'Inactive');

    console.log('\n🎉 WhatsApp configuration fix completed!');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error fixing WhatsApp config:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fixZPWhatsAppConfig();
}

export default fixZPWhatsAppConfig;
