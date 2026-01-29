/**
 * Extract ZP Amaravati Flow from chatbotEngine.ts
 * 
 * This script extracts the hardcoded ZP Amaravati chatbot flow
 * and saves it as a proper ChatbotFlow document in the database.
 * 
 * This allows the flow to be managed through the UI and be customizable.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ChatbotFlow from '../models/ChatbotFlow';
import Company from '../models/Company';
import { connectDatabase } from '../config/database';

dotenv.config();

/**
 * ZP Amaravati Flow Structure
 * Extracted from chatbotEngine.ts
 */
const zpAmaravatiFlow = {
  flowName: 'Zilla Parishad Amaravati Complete Citizen Services Flow',
  flowDescription: `Complete chatbot flow for Zilla Parishad Amaravati with:
- Language selection (English, Hindi, Marathi)
- Main menu with services
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
      messageText: '🇮🇳 *Zilla Parishad Amravati - Official Digital Portal*\n\nNamaskar! Welcome to the official WhatsApp service of Zilla Parishad Amravati.\n\nWe are dedicated to providing transparent and efficient services to all citizens.\n\n👇 *Please select your preferred language:*',
      buttons: [
        {
          id: 'lang_en',
          title: '🇬🇧 English',
          nextStepId: 'main_menu'
        },
        {
          id: 'lang_hi',
          title: '🇮🇳 हिंदी',
          nextStepId: 'main_menu'
        },
        {
          id: 'lang_mr',
          title: '🇮🇳 मराठी',
          nextStepId: 'main_menu'
        }
      ],
      nextStepId: 'main_menu'
    },
    // Step 2: Main Menu
    {
      stepId: 'main_menu',
      stepType: 'buttons' as const,
      stepName: 'Main Menu',
      messageText: '🏛️ *Citizen Services Menu*\n\nWelcome to the Zilla Parishad Digital Helpdesk.\n\n👇 *Please select a service from the options below:*',
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
          nextStepId: 'main_menu' // Returns to menu
        }
      ]
    },
    // Step 3: Grievance Start
    {
      stepId: 'grievance_start',
      stepType: 'message' as const,
      stepName: 'Start Grievance',
      messageText: '📝 *Register a Grievance*\n\nYou can file a formal complaint regarding any ZP department.\n\nTo begin, please provide the details as requested.',
      nextStepId: 'grievance_name'
    },
    // Step 4: Grievance Name
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
    // Step 5: Grievance Department (Note: This is handled dynamically in chatbotEngine, using list type)
    {
      stepId: 'grievance_category',
      stepType: 'list' as const,
      stepName: 'Grievance - Department Selection',
      messageText: '🏢 *Department Selection*\n\nPlease select the relevant department:',
      listConfig: {
        buttonText: 'Select Department',
        sections: [
          {
            title: 'Departments',
            rows: [
              // Note: Rows are dynamically generated from database departments
              // This is a placeholder - actual departments loaded at runtime
            ]
          }
        ]
      },
      nextStepId: 'grievance_description'
    },
    // Step 6: Grievance Description
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
    // Step 7: Grievance Photo
    {
      stepId: 'grievance_photo',
      stepType: 'buttons' as const,
      stepName: 'Grievance - Supporting Evidence',
      messageText: '📎 *Supporting Evidence*\n\nUpload a photo or document to support your grievance (Optional).',
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
      ]
    },
    // Step 8: Grievance Photo Upload (Media step)
    {
      stepId: 'grievance_photo_upload',
      stepType: 'media' as const,
      stepName: 'Grievance - Upload Media',
      messageText: '📤 *Upload Photo*\n\nPlease send a photo or document to support your grievance.',
      mediaConfig: {
        mediaType: 'image' as const,
        optional: true,
        saveToField: 'media',
        nextStepId: 'grievance_confirm'
      }
    },
    // Step 9: Grievance Confirm
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
          nextStepId: 'main_menu'
        }
      ]
    },
    // Step 10: Grievance Success
    {
      stepId: 'grievance_success',
      stepType: 'message' as const,
      stepName: 'Grievance - Success',
      messageText: '✅ *Grievance Registered Successfully*\n\n📄 Reference Number: {grievanceId}\n\nYour grievance has been forwarded to the concerned department.\n\nYou will be notified on status updates.\n\nThank you for contacting Zilla Parishad Amravati.'
    },
    // Step 11: Appointment Start
    {
      stepId: 'appointment_start',
      stepType: 'message' as const,
      stepName: 'Start Appointment',
      messageText: '📅 *Book an Official Appointment*\n\nSchedule a meeting with the Chief Executive Officer (CEO), Zilla Parishad.\n\nPlease provide the required details to proceed with your appointment request.',
      nextStepId: 'appointment_name'
    },
    // Step 12: Appointment Name
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
    // Step 13: Appointment Purpose
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
    // Step 14: Appointment Date (Dynamic Availability)
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
    // Step 15: Appointment Time (Dynamic Availability)
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
    // Step 16: Appointment Verify
    {
      stepId: 'appointment_verify',
      stepType: 'buttons' as const,
      stepName: 'Appointment - Verification',
      messageText: '📋 *Verify Appointment Details*\n\n👤 Name: {citizenName}\n👔 Meeting With: CEO – Zilla Parishad Amravati\n🎯 Purpose: {purpose}\n📅 Date: {appointmentDate}\n⏰ Time: {appointmentTime}\n\nIs the above information correct?',
      buttons: [
        {
          id: 'appt_confirm_yes',
          title: '✅ Confirm Booking',
          nextStepId: 'appointment_submitted'
        },
        {
          id: 'appt_confirm_no',
          title: '❌ Cancel Appointment',
          nextStepId: 'main_menu'
        }
      ]
    },
    // Step 17: Appointment Submitted
    {
      stepId: 'appointment_submitted',
      stepType: 'message' as const,
      stepName: 'Appointment - Success',
      messageText: '✅ *Appointment Request Submitted*\n\nYour appointment request has been received.\n\n📄 Reference Number: {appointmentId}\n📅 Requested Date: {appointmentDate}\n⏰ Requested Time: {appointmentTime}\n\n⏳ Status: Pending Approval\nYou will be notified once the CEO approves or rejects the request.\n\nThank you for your patience.'
    },
    // Step 18: RTS Service Selection
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
                nextStepId: 'main_menu'
              },
              {
                id: 'rts_license',
                title: '📋 License Services',
                description: 'Trade, Driving, Professional licenses',
                nextStepId: 'main_menu'
              },
              {
                id: 'rts_document',
                title: '📄 Document Services',
                description: 'Document verification and attestation',
                nextStepId: 'main_menu'
              },
              {
                id: 'rts_pension',
                title: '💰 Pension Services',
                description: 'Old age, widow, disability pensions',
                nextStepId: 'main_menu'
              },
              {
                id: 'rts_scheme',
                title: '🎯 Scheme Services',
                description: 'Government scheme applications',
                nextStepId: 'main_menu'
              }
            ]
          }
        ]
      }
    },
    // Step 19: Track Status
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
        nextStepId: 'main_menu' // Backend handles status lookup
      }
    }
  ],
  supportedLanguages: ['en', 'hi', 'mr'],
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
 * Main function to extract and save ZP Amaravati flow
 */
async function extractAndSaveZPAmaravatiFlow() {
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

    // Check if flow already exists
    const existingFlow = await ChatbotFlow.findOne({
      companyId: company._id,
      flowName: zpAmaravatiFlow.flowName,
      isDeleted: false
    });

    if (existingFlow) {
      console.log('⚠️ Flow already exists:', existingFlow.flowId);
      console.log('💡 Updating existing flow...');
      
      // Update existing flow
      existingFlow.flowDescription = zpAmaravatiFlow.flowDescription;
      existingFlow.flowType = zpAmaravatiFlow.flowType;
      existingFlow.startStepId = zpAmaravatiFlow.startStepId;
      existingFlow.triggers = zpAmaravatiFlow.triggers as any;
      existingFlow.steps = zpAmaravatiFlow.steps as any;
      existingFlow.supportedLanguages = zpAmaravatiFlow.supportedLanguages;
      existingFlow.defaultLanguage = zpAmaravatiFlow.defaultLanguage;
      existingFlow.settings = zpAmaravatiFlow.settings as any;
      existingFlow.version = (existingFlow.version || 1) + 1;
      
      await existingFlow.save();
      console.log('✅ Flow updated successfully!');
      console.log('📋 Flow ID:', existingFlow.flowId);
      console.log('📊 Version:', existingFlow.version);
    } else {
      console.log('📝 Creating new flow...');
      
      // Create new flow
      const flow = new ChatbotFlow({
        companyId: company._id,
        ...zpAmaravatiFlow,
        isActive: false, // Set to false initially - activate manually
        createdBy: company._id // Use company ID as placeholder
      });

      await flow.save();
      console.log('✅ Flow created successfully!');
      console.log('📋 Flow ID:', flow.flowId);
      console.log('📊 Steps:', flow.steps.length);
      console.log('🎯 Triggers:', flow.triggers.length);
      console.log('\n⚠️ Note: Flow is set to inactive. Please activate it manually from the UI.');
    }

    console.log('\n🎉 ZP Amaravati flow extraction completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Go to SuperAdmin Dashboard');
    console.log('2. Navigate to ZP Amaravati company page');
    console.log('3. Click "Customize Chatbot" button');
    console.log('4. Find the flow and click "Activate"');
    console.log('5. Test by sending "hi" to the WhatsApp number');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error extracting flow:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  extractAndSaveZPAmaravatiFlow();
}

export default extractAndSaveZPAmaravatiFlow;
