
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard';

async function fixCompany() {
  console.log('🚀 Starting fixCompany script...');
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let company = await Company.findOne({ name: 'ZP Amaravati' });

    if (!company) {
      console.log('⚠️ "ZP Amaravati" not found. Creating it...');
        company = await Company.create({
            name: 'ZP Amaravati',
            companyType: 'GOVERNMENT',
            contactEmail: 'contact@zpamaravati.gov.in',
            contactPhone: '+91-2612-220123',
            // companyId will be auto-generated, but we need to force it to CMP000001 if possible or update it after
             enabledModules: [
                'GRIEVANCE',
                'APPOINTMENT',
                'STATUS_TRACKING',
                'SURVEY',
                'FEEDBACK',
                'DOCUMENT_UPLOAD'
            ],
            isActive: true,
            isDeleted: false
        });
    }

    console.log(`ℹ️ Found Company: ${company.name} (${company.companyId})`);

    // Ensure companyId is CMP000001
    const TARGET_ID = 'CMP000001';
    if (company.companyId !== TARGET_ID) {
        console.log(`⚠️ CompanyId is ${company.companyId}, updating to ${TARGET_ID}...`);
        
        // check if target id is taken
        const conflict = await Company.findOne({ companyId: TARGET_ID });
        if (conflict) {
            console.log(`❌ Target ID ${TARGET_ID} is taken by "${conflict.name}". Deleting conflict...`);
            await Company.deleteOne({ _id: conflict._id });
        }
        
        company.companyId = TARGET_ID;
    }

    // Update WhatsApp Config
    console.log('ℹ️ Updating WhatsApp Config from .env...');
    company.whatsappConfig = {
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
    };

    await company.save();
    console.log(`✅ Company updated successfully!`);
    console.log(`   ID: ${company.companyId}`);
    console.log(`   Phone ID: ${company.whatsappConfig?.phoneNumberId}`);
    console.log(`   Access Token: ${company.whatsappConfig?.accessToken ? 'Set' : 'Missing'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixCompany();
