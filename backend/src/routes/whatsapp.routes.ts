import express, { Request, Response } from 'express';
import { requireDatabaseConnection } from '../middleware/dbConnection';
import { processWhatsAppMessage } from '../services/chatbotEngine';
import { getRedisClient, isRedisConnected } from '../config/redis';
import Company from '../models/Company';

const router = express.Router();

/**
 * ============================================================
 * WEBHOOK VERIFICATION (GET)
 * ============================================================
 */
router.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

/**
 * ============================================================
 * WEBHOOK RECEIVER (POST)
 * ============================================================
 */
router.post('/', requireDatabaseConnection, async (req: Request, res: Response) => {
  try {
    const body = req.body;

    console.log(
      '📥 Webhook POST received:',
      JSON.stringify(body, null, 2).substring(0, 500)
    );

    if (body.object !== 'whatsapp_business_account') {
      console.log(`⚠️ Unknown webhook object: ${body.object}`);
      return res.sendStatus(404);
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    console.log(
      `📨 Processing webhook: entry=${!!entry}, changes=${!!changes}`
    );

    if (!value?.messages) {
      console.log('ℹ️ No messages (status update or delivery receipt)');
      return res.status(200).send('EVENT_RECEIVED');
    }

    for (const message of value.messages) {
      try {
        const messageId = message.id;
        
        // IDEMPOTENCY CHECK: Prevent duplicate processing
        if (await isMessageProcessed(messageId)) {
          console.log(`⏭️ Message ${messageId} already processed, skipping...`);
          continue;
        }

        // Mark message as processed (TTL: 48 hours)
        await markMessageAsProcessed(messageId);

        if (message.type === 'interactive') {
          console.log('🔘 Interactive message received');
          await handleInteractiveMessage(message, value.metadata);
        } else {
          console.log(`📝 ${message.type} message received`);
          await handleIncomingMessage(message, value.metadata);
        }
      } catch (msgErr) {
        console.error('❌ Error processing message:', msgErr);
      }
    }

    return res.status(200).send('EVENT_RECEIVED');
  } catch (error: any) {
    console.error('❌ Webhook processing failed:', error);
    return res.status(200).send('ERROR_PROCESSED');
  }
});

/**
 * ============================================================
 * DYNAMIC COMPANY RESOLUTION (MULTI-TENANT)
 * ============================================================
 * Finds the company based on phone number ID from metadata.
 * Falls back to environment variables if company not found.
 */
async function getCompanyFromMetadata(metadata: any): Promise<any> {
  const phoneNumberId = metadata?.phone_number_id;
  
  if (!phoneNumberId) {
    console.warn('⚠️ No phone number ID in metadata, using fallback');
    return getFallbackCompany();
  }
  
  console.log(`🔍 Looking up company by phone number ID: ${phoneNumberId}`);
  
  // Try to find company by phone number ID in WhatsApp config
  const company = await Company.findOne({
    'whatsappConfig.phoneNumberId': phoneNumberId,
    isActive: true,
    isDeleted: false
  });
  
  if (company) {
    console.log(`✅ Company found: ${company.name} (${company.companyId})`);
    
    // Ensure WhatsApp config is set correctly from metadata
    if (!company.whatsappConfig) {
      company.whatsappConfig = {
        phoneNumberId: phoneNumberId,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
      } as any;
    } else {
      // Update phone number ID to match metadata (in case it changed)
      if (company.whatsappConfig.phoneNumberId !== phoneNumberId) {
        console.log(`🔄 Updating phone number ID: ${company.whatsappConfig.phoneNumberId} → ${phoneNumberId}`);
        company.whatsappConfig.phoneNumberId = phoneNumberId;
      }
      
      // Use env token if company doesn't have one or if it matches env phone number ID
      if (!company.whatsappConfig.accessToken || 
          (process.env.WHATSAPP_PHONE_NUMBER_ID === phoneNumberId && process.env.WHATSAPP_ACCESS_TOKEN)) {
        company.whatsappConfig.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || company.whatsappConfig.accessToken || '';
      }
    }
    
    return company;
  }
  
  // If no company found, check if phone number ID matches env var
  if (phoneNumberId === process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.log('⚠️ Company not found in DB, but phone number ID matches env. Using fallback.');
    return getFallbackCompany();
  }
  
  // Last resort: try to find any active company (for backward compatibility)
  console.warn('⚠️ No company found for phone number ID, trying to find any active company');
  const anyCompany = await Company.findOne({
    isActive: true,
    isDeleted: false
  });
  
  if (anyCompany) {
    console.log(`⚠️ Using first active company found: ${anyCompany.name} (${anyCompany.companyId})`);
    // Update its config to use the metadata phone number ID
    if (!anyCompany.whatsappConfig) {
      anyCompany.whatsappConfig = {
        phoneNumberId: phoneNumberId,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
      } as any;
    } else {
      anyCompany.whatsappConfig.phoneNumberId = phoneNumberId;
      if (process.env.WHATSAPP_ACCESS_TOKEN) {
        anyCompany.whatsappConfig.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      }
    }
    return anyCompany;
  }
  
  console.error('❌ No company found. Using fallback.');
  return getFallbackCompany();
}

/**
 * Fallback company context when no company is found in database
 */
function getFallbackCompany() {
  return {
    _id: '000000000000000000000001',
    name: 'Default Company',
    companyId: 'CMP000001',
    enabledModules: ['GRIEVANCE', 'APPOINTMENT'],
    whatsappConfig: {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    }
  } as any;
}

/**
 * ============================================================
 * HANDLE NORMAL MESSAGES
 * ============================================================
 */
async function handleIncomingMessage(message: any, metadata: any) {
  try {
    // Dynamically resolve company from metadata
    const company = await getCompanyFromMetadata(metadata);
    
    if (!company) {
      console.error('❌ Could not resolve company for message');
      return;
    }

    const from = message.from;
    const messageId = message.id;
    const messageType = message.type;

    let messageText = '';
    let mediaUrl = '';

    if (messageType === 'text') {
      messageText = message.text?.body || '';
    } else if (messageType === 'image') {
      messageText = message.image?.caption || '';
      mediaUrl = message.image?.id || '';
    } else if (messageType === 'document') {
      messageText = message.document?.caption || '';
      mediaUrl = message.document?.id || '';
    } else if (messageType === 'audio' || messageType === 'voice') {
      mediaUrl = message.audio?.id || message.voice?.id || '';
    } else if (messageType === 'video') {
      messageText = message.video?.caption || '';
      mediaUrl = message.video?.id || '';
    }

    console.log(
      `📨 Message from ${from} → Company: ${company.name} (ID: ${company.companyId})`
    );

    const response = await processWhatsAppMessage({
      companyId: company.companyId,
      from,
      messageText,
      messageType,
      messageId,
      mediaUrl,
      metadata
    });

    return response;
  } catch (error) {
    console.error('❌ Error in handleIncomingMessage:', error);
    throw error;
  }
}

/**
 * ============================================================
 * HANDLE INTERACTIVE MESSAGES
 * ============================================================
 */
async function handleInteractiveMessage(message: any, metadata: any) {
  try {
    // Dynamically resolve company from metadata
    const company = await getCompanyFromMetadata(metadata);
    
    if (!company) {
      console.error('❌ Could not resolve company for interactive message');
      return;
    }

    const from = message.from;
    const messageId = message.id;
    const interactive = message.interactive;

    let buttonId = '';
    let messageText = '';

    if (interactive?.type === 'button_reply') {
      buttonId = interactive.button_reply?.id || '';
      messageText = interactive.button_reply?.title || '';
    }

    if (interactive?.type === 'list_reply') {
      buttonId = interactive.list_reply?.id || '';
      messageText = interactive.list_reply?.title || '';
    }

    if (!buttonId) return;

    console.log(`🔘 Button "${buttonId}" clicked by ${from}`);

    const response = await processWhatsAppMessage({
      companyId: company.companyId,
      from,
      messageText,
      messageType: 'interactive',
      messageId,
      metadata,
      buttonId
    });

    return response;
  } catch (error) {
    console.error('❌ Error in handleInteractiveMessage:', error);
    throw error;
  }
}

/**
 * ============================================================
 * IDEMPOTENCY PROTECTION
 * ============================================================
 * Prevents duplicate processing of the same WhatsApp message
 */
const MESSAGE_TTL = 48 * 60 * 60; // 48 hours in seconds

async function isMessageProcessed(messageId: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !isRedisConnected()) {
    // If Redis unavailable, we can't check idempotency
    // In production, you might want to use MongoDB as fallback
    return false;
  }

  try {
    const key = `processed_message:${messageId}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('❌ Error checking message idempotency:', error);
    return false; // Allow processing if check fails
  }
}

async function markMessageAsProcessed(messageId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisConnected()) {
    return;
  }

  try {
    const key = `processed_message:${messageId}`;
    await redis.setex(key, MESSAGE_TTL, '1');
  } catch (error) {
    console.error('❌ Error marking message as processed:', error);
  }
}

export default router;
