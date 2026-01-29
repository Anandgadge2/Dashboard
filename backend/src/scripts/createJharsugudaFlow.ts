/**
 * Create Complete Jharsuguda Odisha Collector Office Flow
 * 
 * Based on ZP Amaravati flow structure, but customized for Jharsuguda
 * with English, Hindi, and Odia language support
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ChatbotFlow from '../models/ChatbotFlow';
import Company from '../models/Company';
import { connectDatabase } from '../config/database';

dotenv.config();

/**
 * Jharsuguda Flow Structure
 * Complete flow with English, Hindi, and Odia support
 */
const jharsugudaFlow = {
  flowName: 'Jharsuguda Odisha Collector Office Complete Citizen Services Flow',
  flowDescription: `Complete chatbot flow for Jharsuguda Odisha Collector Office with:
- Language selection (English, Hindi, Odia)
- Main menu with services in selected language
- CEO appointment booking with dynamic availability
- Department-based grievance filing
- Right to Service (RTS) services
- Status tracking`,
  flowType: 'custom' as const,
  startStepId: 'language_selection',
  triggers: [
    {
      triggerType: 'keyword' as const,
      triggerValue: 'hi',
      startStepId: 'language_selection'
    },
    {
      triggerType: 'keyword' as const,
      triggerValue: 'hello',
      startStepId: 'language_selection'
    },
    {
      triggerType: 'keyword' as const,
      triggerValue: 'start',
      startStepId: 'language_selection'
    },
    {
      triggerType: 'keyword' as const,
      triggerValue: 'menu',
      startStepId: 'language_selection'
    },
    {
      triggerType: 'keyword' as const,
      triggerValue: 'namaste',
      startStepId: 'language_selection'
    }
  ],
  steps: [
    // Step 1: Language Selection
    {
      stepId: 'language_selection',
      stepType: 'buttons' as const,
      stepName: 'Language Selection',
      messageText: '🇮🇳 *Jharsuguda Odisha Collector Office - Official Digital Portal*\n\nNamaskar! Welcome to the official WhatsApp service of Jharsuguda Odisha Collector Office.\n\nWe are dedicated to providing transparent and efficient services to all citizens.\n\n👇 *Please select your preferred language:*',
      buttons: [
        {
          id: 'lang_en',
          title: '🇬🇧 English',
          nextStepId: 'main_menu_en'
        },
        {
          id: 'lang_hi',
          title: '🇮🇳 हिंदी',
          nextStepId: 'main_menu_hi'
        },
        {
          id: 'lang_or',
          title: '🇮🇳 ଓଡ଼ିଆ',
          nextStepId: 'main_menu_or'
        }
      ],
      expectedResponses: [
        {
          type: 'button_click' as const,
          value: 'lang_en',
          nextStepId: 'main_menu_en'
        },
        {
          type: 'button_click' as const,
          value: 'lang_hi',
          nextStepId: 'main_menu_hi'
        },
        {
          type: 'button_click' as const,
          value: 'lang_or',
          nextStepId: 'main_menu_or'
        }
      ],
      nextStepId: 'main_menu_en'
    },
    // Step 2: Main Menu (English)
    {
      stepId: 'main_menu_en',
      stepType: 'buttons' as const,
      stepName: 'Main Menu (English)',
      messageText: '🏛️ *Citizen Services Menu*\n\nWelcome to the Jharsuguda Odisha Collector Office Digital Helpdesk.\n\n👇 *Please select a service from the options below:*',
      buttons: [
        {
          id: 'grievance',
          title: '📝 File Grievance',
          nextStepId: 'grievance_start'
        },
        {
          id: 'appointment',
          title: '📅 Book Appointment',
          nextStepId: 'appointment_start'
        },
        {
          id: 'rts',
          title: '📋 Right to Service',
          nextStepId: 'rts_service_selection'
        },
        {
          id: 'track',
          title: '🔍 Track Status',
          nextStepId: 'track_status'
        },
        {
          id: 'help',
          title: 'ℹ️ Help',
          nextStepId: 'main_menu_en'
        }
      ],
      expectedResponses: [
        {
          type: 'button_click' as const,
          value: 'grievance',
          nextStepId: 'grievance_start'
        },
        {
          type: 'button_click' as const,
          value: 'appointment',
          nextStepId: 'appointment_start'
        },
        {
          type: 'button_click' as const,
          value: 'rts',
          nextStepId: 'rts_service_selection'
        },
        {
          type: 'button_click' as const,
          value: 'track',
          nextStepId: 'track_status'
        },
        {
          type: 'button_click' as const,
          value: 'help',
          nextStepId: 'main_menu_en'
        }
      ]
    },
    // Step 3: Main Menu (Hindi)
    {
      stepId: 'main_menu_hi',
      stepType: 'buttons' as const,
      stepName: 'Main Menu (Hindi)',
      messageText: '🏛️ *नागरिक सेवा मेनू*\n\nझारसुगुड़ा ओडिशा कलेक्टर कार्यालय डिजिटल हेल्पडेस्क में आपका स्वागत है।\n\n👇 *कृपया नीचे दिए गए विकल्पों में से एक सेवा चुनें:*',
      buttons: [
        {
          id: 'grievance',
          title: '📝 शिकायत दर्ज करें',
          nextStepId: 'grievance_start'
        },
        {
          id: 'appointment',
          title: '📅 अपॉइंटमेंट बुक करें',
          nextStepId: 'appointment_start'
        },
        {
          id: 'rts',
          title: '📋 सेवा का अधिकार',
          nextStepId: 'rts_service_selection'
        },
        {
          id: 'track',
          title: '🔍 स्थिति ट्रैक करें',
          nextStepId: 'track_status'
        },
        {
          id: 'help',
          title: 'ℹ️ सहायता',
          nextStepId: 'main_menu_hi'
        }
      ],
      expectedResponses: [
        {
          type: 'button_click' as const,
          value: 'grievance',
          nextStepId: 'grievance_start'
        },
        {
          type: 'button_click' as const,
          value: 'appointment',
          nextStepId: 'appointment_start'
        },
        {
          type: 'button_click' as const,
          value: 'rts',
          nextStepId: 'rts_service_selection'
        },
        {
          type: 'button_click' as const,
          value: 'track',
          nextStepId: 'track_status'
        },
        {
          type: 'button_click' as const,
          value: 'help',
          nextStepId: 'main_menu_hi'
        }
      ]
    },
    // Step 4: Main Menu (Odia)
    {
      stepId: 'main_menu_or',
      stepType: 'buttons' as const,
      stepName: 'Main Menu (Odia)',
      messageText: '🏛️ *ନାଗରିକ ସେବା ମେନୁ*\n\nଝାରସୁଗୁଡା ଓଡ଼ିଶା କଲେକ୍ଟର କାର୍ଯ୍ୟାଳୟ ଡିଜିଟାଲ୍ ହେଲ୍ପଡେସ୍କରେ ସ୍ୱାଗତ।\n\n👇 *ଦୟାକରି ନିମ୍ନଲିଖିତ ବିକଳ୍ପଗୁଡ଼ିକରୁ ଏକ ସେବା ବାଛନ୍ତୁ:*',
      buttons: [
        {
          id: 'grievance',
          title: '📝 ଅଭିଯୋଗ ଦାଖଲ କରନ୍ତୁ',
          nextStepId: 'grievance_start'
        },
        {
          id: 'appointment',
          title: '📅 ନିଯୁକ୍ତି ବୁକ୍ କରନ୍ତୁ',
          nextStepId: 'appointment_start'
        },
        {
          id: 'rts',
          title: '📋 ସେବାର ଅଧିକାର',
          nextStepId: 'rts_service_selection'
        },
        {
          id: 'track',
          title: '🔍 ସ୍ଥିତି ଟ୍ରାକ୍ କରନ୍ତୁ',
          nextStepId: 'track_status'
        },
        {
          id: 'help',
          title: 'ℹ️ ସାହାଯ୍ୟ',
          nextStepId: 'main_menu_or'
        }
      ],
      expectedResponses: [
        {
          type: 'button_click' as const,
          value: 'grievance',
          nextStepId: 'grievance_start'
        },
        {
          type: 'button_click' as const,
          value: 'appointment',
          nextStepId: 'appointment_start'
        },
        {
          type: 'button_click' as const,
          value: 'rts',
          nextStepId: 'rts_service_selection'
        },
        {
          type: 'button_click' as const,
          value: 'track',
          nextStepId: 'track_status'
        },
        {
          type: 'button_click' as const,
          value: 'help',
          nextStepId: 'main_menu_or'
        }
      ]
    },
    // Step 5: Grievance Start
    {
      stepId: 'grievance_start',
      stepType: 'message' as const,
      stepName: 'Start Grievance',
      messageText: '📝 *Register a Grievance*\n\nYou can file a formal complaint regarding any Jharsuguda Odisha Collector Office department.\n\nTo begin, please provide the details as requested.',
      nextStepId: 'grievance_name'
    },
    // Step 6: Grievance Name
    {
      stepId: 'grievance_name',
      stepType: 'input' as const,
      stepName: 'Grievance - Citizen Name',
      messageText: '👤 *Citizen Identification*\n\nPlease enter your Full Name as per official documents:',
      inputConfig: {
        inputType: 'text' as const,
        validation: {
          required: true,
          minLength: 2,
          errorMessage: 'Name must be at least 2 characters long.'
        },
        saveToField: 'citizenName',
        nextStepId: 'grievance_category'
      }
    },
    // Step 7: Grievance Department (Auto-loaded from database)
    {
      stepId: 'grievance_category',
      stepType: 'message' as const,
      stepName: 'Grievance - Department Selection',
      messageText: '🏢 *Department Selection*\n\nPlease select the relevant department:',
      // Note: This step is handled dynamically in dynamicFlowEngine.ts
      // It automatically loads departments from the database
      nextStepId: 'grievance_description'
    },
    // Step 8: Grievance Description
    {
      stepId: 'grievance_description',
      stepType: 'input' as const,
      stepName: 'Grievance - Description',
      messageText: '✍️ *Grievance Details*\n\nPlease describe your issue in detail.\n\nTip: Include date, location, and specific information for faster resolution.',
      inputConfig: {
        inputType: 'text' as const,
        validation: {
          required: true,
          minLength: 10,
          errorMessage: 'Description must be at least 10 characters long.'
        },
        saveToField: 'description',
        nextStepId: 'grievance_photo'
      }
    },
    // Step 9: Grievance Photo
    {
      stepId: 'grievance_photo',
      stepType: 'buttons' as const,
      stepName: 'Grievance - Supporting Evidence',
      messageText: '📎 *Supporting Evidence (Optional)*\n\nUpload a photo or document to support your grievance.\n\nSupported formats: JPG, PNG, WEBP, PDF.',
      buttons: [
        {
          id: 'photo_skip',
          title: '⏭ Skip',
          nextStepId: 'grievance_confirm'
        },
        {
          id: 'photo_upload',
          title: '📤 Upload Photo',
          nextStepId: 'grievance_photo_upload'
        }
      ],
      expectedResponses: [
        {
          type: 'button_click' as const,
          value: 'photo_skip',
          nextStepId: 'grievance_confirm'
        },
        {
          type: 'button_click' as const,
          value: 'photo_upload',
          nextStepId: 'grievance_photo_upload'
        }
      ]
    },
    // Step 10: Grievance Photo Upload
    {
      stepId: 'grievance_photo_upload',
      stepType: 'input' as const,
      stepName: 'Grievance - Upload Media',
      messageText: '📤 *Upload Photo*\n\nPlease send a photo or document to support your grievance.',
      inputConfig: {
        inputType: 'image' as const,
        validation: {
          required: false
        },
        saveToField: 'media',
        nextStepId: 'grievance_confirm'
      }
    },
    // Step 11: Grievance Confirm
    {
      stepId: 'grievance_confirm',
      stepType: 'buttons' as const,
      stepName: 'Grievance - Verification',
      messageText: '📋 *Confirm Submission*\n\n👤 Name: {citizenName}\n🏢 Department: {category}\n📝 Issue: {description}\n\nIs the above information correct?',
      buttons: [
        {
          id: 'confirm_yes',
          title: '✅ Submit Grievance',
          nextStepId: 'grievance_success'
        },
        {
          id: 'confirm_no',
          title: '❌ Cancel',
          nextStepId: 'main_menu_en'
        }
      ],
      expectedResponses: [
        {
          type: 'button_click' as const,
          value: 'confirm_yes',
          nextStepId: 'grievance_success'
        },
        {
          type: 'button_click' as const,
          value: 'confirm_no',
          nextStepId: 'main_menu_en'
        }
      ]
    },
    // Step 12: Grievance Success
    {
      stepId: 'grievance_success',
      stepType: 'message' as const,
      stepName: 'Grievance - Success',
      messageText: '✅ *Grievance Registered Successfully*\n\n📄 Reference Number: {grievanceId}\n\nYour grievance has been forwarded to the concerned department.\n\nYou will be notified on status updates.\n\nThank you for contacting Jharsuguda Odisha Collector Office.'
    },
    // Step 13: Appointment Start
    {
      stepId: 'appointment_start',
      stepType: 'message' as const,
      stepName: 'Start Appointment',
      messageText: '📅 *Book an Official Appointment*\n\nSchedule a meeting with the Chief Executive Officer (CEO), Jharsuguda Odisha Collector Office.\n\nPlease provide the required details to proceed with your appointment request.',
      nextStepId: 'appointment_name'
    },
    // Step 14: Appointment Name
    {
      stepId: 'appointment_name',
      stepType: 'input' as const,
      stepName: 'Appointment - Citizen Name',
      messageText: '👤 *New Appointment Request*\n\nPlease enter your Full Name (as per official records):',
      inputConfig: {
        inputType: 'text' as const,
        validation: {
          required: true,
          minLength: 2,
          errorMessage: 'Name must be at least 2 characters long.'
        },
        saveToField: 'citizenName',
        nextStepId: 'appointment_purpose'
      }
    },
    // Step 15: Appointment Purpose
    {
      stepId: 'appointment_purpose',
      stepType: 'input' as const,
      stepName: 'Appointment - Purpose',
      messageText: '🎯 *Purpose of Meeting*\n\nPlease briefly describe the purpose of your meeting with the CEO:',
      inputConfig: {
        inputType: 'text' as const,
        validation: {
          required: true,
          minLength: 5,
          errorMessage: 'Purpose must be at least 5 characters long.'
        },
        saveToField: 'purpose',
        nextStepId: 'appointment_date'
      }
    },
    // Step 16: Appointment Date (Dynamic Availability)
    {
      stepId: 'appointment_date',
      stepType: 'api_call' as const,
      stepName: 'Appointment - Date Selection',
      messageText: '📅 *Select Preferred Date*\n\nPlease choose a convenient date for your appointment:',
      apiConfig: {
        endpoint: '/api/availability/chatbot/{companyId}',
        method: 'GET' as const,
        headers: {},
        body: {},
        saveResponseTo: 'availabilityData',
        nextStepId: 'appointment_time'
      },
      nextStepId: 'appointment_time'
    },
    // Step 17: Appointment Time (Dynamic Availability)
    {
      stepId: 'appointment_time',
      stepType: 'api_call' as const,
      stepName: 'Appointment - Time Selection',
      messageText: '⏰ *Select Time Slot*\n\nPlease choose a preferred time:',
      apiConfig: {
        endpoint: '/api/availability/chatbot/{companyId}',
        method: 'GET' as const,
        headers: {},
        body: {
          selectedDate: '{appointmentDate}'
        },
        saveResponseTo: 'timeSlotsData',
        nextStepId: 'appointment_verify'
      },
      nextStepId: 'appointment_verify'
    },
    // Step 18: Appointment Verify
    {
      stepId: 'appointment_verify',
      stepType: 'buttons' as const,
      stepName: 'Appointment - Verification',
      messageText: '📋 *Verify Appointment Details*\n\n👤 Name: {citizenName}\n👔 Meeting With: CEO – Jharsuguda Odisha Collector Office\n🎯 Purpose: {purpose}\n📅 Date: {appointmentDate}\n⏰ Time: {appointmentTime}\n\nIs the above information correct?',
      buttons: [
        {
          id: 'appt_confirm_yes',
          title: '✅ Confirm Booking',
          nextStepId: 'appointment_submitted'
        },
        {
          id: 'appt_confirm_no',
          title: '❌ Cancel Appointment',
          nextStepId: 'main_menu_en'
        }
      ],
      expectedResponses: [
        {
          type: 'button_click' as const,
          value: 'appt_confirm_yes',
          nextStepId: 'appointment_submitted'
        },
        {
          type: 'button_click' as const,
          value: 'appt_confirm_no',
          nextStepId: 'main_menu_en'
        }
      ]
    },
    // Step 19: Appointment Submitted
    {
      stepId: 'appointment_submitted',
      stepType: 'message' as const,
      stepName: 'Appointment - Success',
      messageText: '✅ *Appointment Request Submitted*\n\nYour appointment request has been received.\n\n📄 Reference Number: {appointmentId}\n📅 Requested Date: {appointmentDate}\n⏰ Requested Time: {appointmentTime}\n\n⏳ Status: Pending Approval\nYou will be notified once the CEO approves or rejects the request.\n\nThank you for your patience.'
    },
    // Step 20: RTS Service Selection
    {
      stepId: 'rts_service_selection',
      stepType: 'list' as const,
      stepName: 'RTS - Service Selection',
      messageText: '📋 *Right to Service (RTS)*\n\nPlease select a service:',
      listConfig: {
        buttonText: 'Select Service',
        sections: [
          {
            title: 'RTS Services',
            rows: [
              {
                id: 'rts_certificate',
                title: '📜 Certificate Services',
                description: 'Birth, Death, Income, Caste certificates',
                nextStepId: 'main_menu_en'
              },
              {
                id: 'rts_license',
                title: '📋 License Services',
                description: 'Trade, Driving, Professional licenses',
                nextStepId: 'main_menu_en'
              },
              {
                id: 'rts_document',
                title: '📄 Document Services',
                description: 'Document verification and attestation',
                nextStepId: 'main_menu_en'
              },
              {
                id: 'rts_pension',
                title: '💰 Pension Services',
                description: 'Old age, widow, disability pensions',
                nextStepId: 'main_menu_en'
              },
              {
                id: 'rts_scheme',
                title: '🎯 Scheme Services',
                description: 'Government scheme applications',
                nextStepId: 'main_menu_en'
              }
            ]
          }
        ]
      }
    },
    // Step 21: Track Status
    {
      stepId: 'track_status',
      stepType: 'input' as const,
      stepName: 'Track Status',
      messageText: '🔍 *Track Status*\n\nPlease enter your Reference Number:',
      inputConfig: {
        inputType: 'text' as const,
        validation: {
          required: true,
          errorMessage: 'Please enter a valid reference number.'
        },
        saveToField: 'referenceNumber',
        nextStepId: 'main_menu_en'
      }
    }
  ],
  supportedLanguages: ['en', 'hi', 'or'],
  defaultLanguage: 'en',
  settings: {
    sessionTimeout: 30,
    enableTypingIndicator: true,
    enableReadReceipts: true,
    maxRetries: 3,
    errorFallbackMessage: 'We encountered an error. Please try again.'
  }
};

/**
 * Main function to create and save Jharsuguda flow
 */
async function createJharsugudaFlow() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDatabase();

    // Find Jharsuguda company
    const company = await Company.findOne({ 
      $or: [
        { name: /jharsuguda/i },
        { companyId: 'CMP000003' }
      ]
    });

    if (!company) {
      console.error('❌ Jharsuguda company not found!');
      console.log('💡 Available companies:');
      const allCompanies = await Company.find({}, 'name companyId').limit(10);
      allCompanies.forEach(c => console.log(`   - ${c.name} (${c.companyId})`));
      process.exit(1);
    }

    console.log('✅ Found company:', company.name, `(${company.companyId})`);

    // Check if flow already exists
    const existingFlow = await ChatbotFlow.findOne({
      companyId: company._id,
      flowName: jharsugudaFlow.flowName,
      isDeleted: false
    });

    if (existingFlow) {
      console.log('⚠️ Flow already exists:', existingFlow.flowId);
      console.log('💡 Updating existing flow...');
      
      // Update existing flow
      existingFlow.flowDescription = jharsugudaFlow.flowDescription;
      existingFlow.flowType = jharsugudaFlow.flowType;
      existingFlow.startStepId = jharsugudaFlow.startStepId;
      existingFlow.triggers = jharsugudaFlow.triggers as any;
      existingFlow.steps = jharsugudaFlow.steps as any;
      existingFlow.supportedLanguages = jharsugudaFlow.supportedLanguages;
      existingFlow.defaultLanguage = jharsugudaFlow.defaultLanguage;
      existingFlow.settings = jharsugudaFlow.settings as any;
      existingFlow.version = (existingFlow.version || 1) + 1;
      existingFlow.isActive = true; // Activate the flow
      
      await existingFlow.save();
      console.log('✅ Flow updated successfully!');
      console.log('📋 Flow ID:', existingFlow.flowId);
      console.log('📊 Version:', existingFlow.version);
      console.log('📊 Steps:', existingFlow.steps.length);
      console.log('🎯 Triggers:', existingFlow.triggers.length);
      console.log('🌐 Languages:', existingFlow.supportedLanguages.join(', '));
    } else {
      console.log('📝 Creating new flow...');
      
      // Find a super admin user for createdBy
      const User = (await import('../models/User')).default;
      const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
      
      // Create new flow
      const flow = new ChatbotFlow({
        companyId: company._id,
        ...jharsugudaFlow,
        isActive: true, // Activate by default
        createdBy: superAdmin?._id || company._id,
        updatedBy: superAdmin?._id || company._id
      });

      await flow.save();
      console.log('✅ Flow created successfully!');
      console.log('📋 Flow ID:', flow.flowId);
      console.log('📊 Steps:', flow.steps.length);
      console.log('🎯 Triggers:', flow.triggers.length);
      console.log('🌐 Languages:', flow.supportedLanguages.join(', '));
      console.log('✅ Flow is ACTIVE and ready to use!');
    }

    console.log('\n🎉 Jharsuguda flow creation completed!');
    console.log('\n📝 Flow Details:');
    console.log(`   - Name: ${jharsugudaFlow.flowName}`);
    console.log(`   - Steps: ${jharsugudaFlow.steps.length}`);
    console.log(`   - Triggers: ${jharsugudaFlow.triggers.length}`);
    console.log(`   - Languages: ${jharsugudaFlow.supportedLanguages.join(', ')}`);
    console.log('\n📝 Next Steps:');
    console.log('1. Go to SuperAdmin Dashboard');
    console.log('2. Navigate to Jharsuguda company page');
    console.log('3. Click "Customize Chatbot" button');
    console.log('4. The flow should be visible and active');
    console.log('5. Test by sending "hi" to the WhatsApp number');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating flow:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createJharsugudaFlow();
}

export default createJharsugudaFlow;
