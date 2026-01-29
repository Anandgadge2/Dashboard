/**
 * Duplicate ZP Amaravati Flow for Jharsuguda Odisha
 * 
 * This script duplicates the ZP Amaravati chatbot flow for Jharsuguda Odisha (Company 3)
 * and replaces Marathi language with Odia language throughout the flow.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ChatbotFlow from '../models/ChatbotFlow';
import Company from '../models/Company';
import User from '../models/User';
import { connectDatabase } from '../config/database';

dotenv.config();

/**
 * Replace Marathi with Odia in text content
 */
function replaceMarathiWithOdia(text: string): string {
  if (!text) return text;
  
  // Replace language codes
  let result = text.replace(/lang_mr/g, 'lang_or');
  result = result.replace(/मराठी/g, 'ଓଡ଼ିଆ'); // Odia script
  result = result.replace(/Marathi/gi, 'Odia');
  result = result.replace(/marathi/gi, 'odia');
  
  // Replace ZP Amaravati references with Jharsuguda Odisha
  result = result.replace(/Zilla Parishad Amravati/gi, 'Jharsuguda Odisha Government');
  result = result.replace(/Zilla Parishad Amaravati/gi, 'Jharsuguda Odisha Government');
  result = result.replace(/ZP Amaravati/gi, 'Jharsuguda Odisha');
  result = result.replace(/ZP Amravati/gi, 'Jharsuguda Odisha');
  
  return result;
}

/**
 * Process step to replace Marathi with Odia
 */
function processStep(step: any): any {
  const processedStep = { ...step };
  
  // Replace in message text
  if (processedStep.messageText) {
    processedStep.messageText = replaceMarathiWithOdia(processedStep.messageText);
  }
  
  // Replace in buttons
  if (processedStep.buttons && Array.isArray(processedStep.buttons)) {
    processedStep.buttons = processedStep.buttons.map((btn: any) => {
      const processedBtn = { ...btn };
      
      // Replace Marathi button with Odia
      if (btn.id === 'lang_mr') {
        processedBtn.id = 'lang_or';
        processedBtn.title = replaceMarathiWithOdia(btn.title);
      } else {
        processedBtn.title = replaceMarathiWithOdia(btn.title);
      }
      
      return processedBtn;
    });
  }
  
  // Replace in interactive buttons
  if (processedStep.interactiveButtons && Array.isArray(processedStep.interactiveButtons)) {
    processedStep.interactiveButtons = processedStep.interactiveButtons.map((btn: any) => {
      const processedBtn = { ...btn };
      processedBtn.title = replaceMarathiWithOdia(btn.title);
      if (btn.id === 'lang_mr') {
        processedBtn.id = 'lang_or';
      }
      return processedBtn;
    });
  }
  
  // Replace in list items
  if (processedStep.listItems && Array.isArray(processedStep.listItems)) {
    processedStep.listItems = processedStep.listItems.map((item: any) => {
      const processedItem = { ...item };
      processedItem.title = replaceMarathiWithOdia(item.title);
      processedItem.description = replaceMarathiWithOdia(item.description);
      return processedItem;
    });
  }
  
  // Replace in content (for frontend format)
  if (processedStep.content) {
    const processedContent = { ...processedStep.content };
    
    if (processedContent.text) {
      if (typeof processedContent.text === 'string') {
        processedContent.text = replaceMarathiWithOdia(processedContent.text);
      } else if (typeof processedContent.text === 'object') {
        // Handle multilingual text
        Object.keys(processedContent.text).forEach(key => {
          if (key === 'mr') {
            // Rename mr to or
            processedContent.text['or'] = replaceMarathiWithOdia(processedContent.text[key]);
            delete processedContent.text[key];
          } else {
            processedContent.text[key] = replaceMarathiWithOdia(processedContent.text[key]);
          }
        });
      }
    }
    
    if (processedContent.buttons && Array.isArray(processedContent.buttons)) {
      processedContent.buttons = processedContent.buttons.map((btn: any) => {
        const processedBtn = { ...btn };
        if (btn.id === 'lang_mr') {
          processedBtn.id = 'lang_or';
        }
        if (btn.text) {
          if (typeof btn.text === 'string') {
            processedBtn.text = replaceMarathiWithOdia(btn.text);
          } else if (typeof btn.text === 'object') {
            Object.keys(btn.text).forEach(key => {
              if (key === 'mr') {
                processedBtn.text['or'] = replaceMarathiWithOdia(btn.text[key]);
                delete processedBtn.text[key];
              } else {
                processedBtn.text[key] = replaceMarathiWithOdia(btn.text[key]);
              }
            });
          }
        }
        return processedBtn;
      });
    }
    
    processedStep.content = processedContent;
  }
  
  return processedStep;
}

/**
 * Duplicate flow for Jharsuguda Odisha
 */
async function duplicateFlowForJharsuguda() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDatabase();

    // Find Jharsuguda Odisha company (Company 3)
    const jharsugudaCompany = await Company.findOne({
      $or: [
        { name: /Jharsuguda/i },
        { name: /Odisha/i },
        { companyId: 'CMP000003' }
      ]
    });

    if (!jharsugudaCompany) {
      console.error('❌ Jharsuguda Odisha company not found!');
      console.log('💡 Please ensure Company 3 (Jharsuguda Odisha) exists in the database.');
      process.exit(1);
    }

    console.log('✅ Found company:', jharsugudaCompany.name, `(${jharsugudaCompany.companyId})`);

    // Find ZP Amaravati company
    const zpCompany = await Company.findOne({
      $or: [
        { name: 'ZP Amaravati' },
        { companyId: 'CMP000001' }
      ]
    });

    if (!zpCompany) {
      console.error('❌ ZP Amaravati company not found!');
      process.exit(1);
    }

    console.log('✅ Found ZP Amaravati:', zpCompany.name, `(${zpCompany.companyId})`);

    // Find the ZP Amaravati flow
    const zpFlow = await ChatbotFlow.findOne({
      companyId: zpCompany._id,
      flowName: /Zilla Parishad Amaravati/i
    }).sort({ createdAt: -1 }); // Get the most recent one

    if (!zpFlow) {
      console.error('❌ ZP Amaravati flow not found!');
      console.log('💡 Please ensure the ZP Amaravati flow exists in the database.');
      process.exit(1);
    }

    console.log('✅ Found ZP Amaravati flow:', zpFlow.flowName, `(${zpFlow.flowId})`);

    // Find a superadmin user for createdBy
    const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!superAdmin) {
      console.error('❌ SuperAdmin user not found!');
      process.exit(1);
    }

    // Check if flow already exists for Jharsuguda
    const existingFlow = await ChatbotFlow.findOne({
      companyId: jharsugudaCompany._id,
      flowName: /Jharsuguda/i
    });

    if (existingFlow) {
      console.log('⚠️ Flow already exists for Jharsuguda Odisha. Updating...');
      
      // Update existing flow
      const flowData: any = zpFlow.toObject();
      delete flowData._id;
      delete flowData.flowId;
      delete flowData.createdAt;
      delete flowData.updatedAt;
      
      // Process flow data
      flowData.flowName = (flowData.flowName || '').replace(/Zilla Parishad Amaravati/gi, 'Jharsuguda Odisha Government');
      flowData.flowName = flowData.flowName.replace(/ZP Amaravati/gi, 'Jharsuguda Odisha');
      flowData.flowDescription = replaceMarathiWithOdia(flowData.flowDescription || '');
      flowData.companyId = jharsugudaCompany._id;
      flowData.createdBy = superAdmin._id;
      flowData.updatedBy = superAdmin._id;
      
      // Process steps
      if (flowData.steps && Array.isArray(flowData.steps)) {
        flowData.steps = flowData.steps.map(processStep);
      }
      
      // Process triggers
      if (flowData.triggers && Array.isArray(flowData.triggers)) {
        flowData.triggers = flowData.triggers.map((trigger: any) => ({
          ...trigger,
          triggerValue: replaceMarathiWithOdia(trigger.triggerValue)
        }));
      }
      
      Object.assign(existingFlow, flowData);
      await existingFlow.save();
      
      console.log('✅ Flow updated successfully!');
      console.log('📋 Flow ID:', existingFlow.flowId);
    } else {
      // Create new flow
      console.log('📝 Creating new flow for Jharsuguda Odisha...');
      
      const flowData: any = zpFlow.toObject();
      delete flowData._id;
      delete flowData.flowId;
      delete flowData.createdAt;
      delete flowData.updatedAt;
      
      // Process flow data
      flowData.flowName = (flowData.flowName || '').replace(/Zilla Parishad Amaravati/gi, 'Jharsuguda Odisha Government');
      flowData.flowName = flowData.flowName.replace(/ZP Amaravati/gi, 'Jharsuguda Odisha');
      flowData.flowDescription = replaceMarathiWithOdia(flowData.flowDescription || '');
      flowData.companyId = jharsugudaCompany._id;
      flowData.createdBy = superAdmin._id;
      flowData.updatedBy = superAdmin._id;
      flowData.isActive = false; // Start as inactive
      flowData.version = 1;
      
      // Process steps
      if (flowData.steps && Array.isArray(flowData.steps)) {
        flowData.steps = flowData.steps.map(processStep);
      }
      
      // Process triggers
      if (flowData.triggers && Array.isArray(flowData.triggers)) {
        flowData.triggers = flowData.triggers.map((trigger: any) => ({
          ...trigger,
          triggerValue: replaceMarathiWithOdia(trigger.triggerValue)
        }));
      }
      
      const newFlow = await ChatbotFlow.create(flowData);
      
      console.log('✅ Flow created successfully!');
      console.log('📋 Flow ID:', newFlow.flowId);
      console.log('📋 Flow Name:', newFlow.flowName);
    }

    console.log('\n📊 Summary:');
    console.log('   Source Company: ZP Amaravati (CMP000001)');
    console.log('   Target Company: Jharsuguda Odisha (CMP000003)');
    console.log('   Language Changes: Marathi (mr) → Odia (or)');
    console.log('   Company References: ZP Amaravati → Jharsuguda Odisha');

    console.log('\n🎉 Flow duplication completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Review the flow in the superadmin dashboard');
    console.log('   2. Configure WhatsApp settings for Jharsuguda Odisha');
    console.log('   3. Activate and assign the flow to WhatsApp');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error duplicating flow:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  duplicateFlowForJharsuguda();
}

export default duplicateFlowForJharsuguda;
