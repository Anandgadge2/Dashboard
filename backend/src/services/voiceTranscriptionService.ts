import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Voice Transcription Service
 * Handles transcription of voice notes/audio messages
 * 
 * Note: This is a placeholder implementation. For production, integrate with:
 * - Google Speech-to-Text API
 * - AWS Transcribe
 * - Azure Speech Services
 * - OpenAI Whisper API
 */

interface TranscriptionResult {
  success: boolean;
  text?: string;
  language?: string;
  error?: string;
}

/**
 * Download audio file from WhatsApp Media API
 */
async function downloadAudioFromWhatsApp(
  mediaId: string,
  accessToken: string
): Promise<string | null> {
  try {
    // Get media URL
    const mediaUrl = `https://graph.facebook.com/v18.0/${mediaId}`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`
    };

    const response = await axios.get(mediaUrl, { headers });
    const downloadUrl = response.data.url;

    if (!downloadUrl) {
      console.error('❌ No download URL in media response');
      return null;
    }

    // Download the file
    const audioResponse = await axios.get(downloadUrl, {
      headers,
      responseType: 'stream'
    });

    // Save to temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio_${Date.now()}.ogg`);

    const writer = fs.createWriteStream(tempFilePath);
    audioResponse.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(tempFilePath));
      writer.on('error', reject);
    });
  } catch (error: any) {
    console.error('❌ Error downloading audio:', error.message);
    return null;
  }
}

/**
 * Transcribe audio using a transcription service
 * 
 * This is a placeholder. Replace with actual transcription service:
 * 
 * Option 1: OpenAI Whisper API
 * Option 2: Google Speech-to-Text
 * Option 3: AWS Transcribe
 * Option 4: Azure Speech Services
 */
async function transcribeAudio(
  audioFilePath: string,
  language: string = 'en'
): Promise<TranscriptionResult> {
  try {
    // Placeholder: Return a mock transcription
    // In production, replace this with actual API call
    
    // Example with OpenAI Whisper (if you have API key):
    /*
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(audioFilePath));
    form.append('model', 'whisper-1');
    form.append('language', language);

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders()
        }
      }
    );

    return {
      success: true,
      text: response.data.text,
      language: language
    };
    */

    // For now, return a placeholder
    console.log('⚠️  Voice transcription not configured. Please set up a transcription service.');
    
    return {
      success: false,
      error: 'Voice transcription service not configured. Please set up OpenAI Whisper, Google Speech-to-Text, or similar service.'
    };

  } catch (error: any) {
    console.error('❌ Error transcribing audio:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Clean up temporary file
    try {
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    } catch (cleanupError) {
      console.error('⚠️  Error cleaning up temp file:', cleanupError);
    }
  }
}

/**
 * Main function to transcribe WhatsApp voice message
 */
export async function transcribeWhatsAppVoice(
  mediaId: string,
  accessToken: string,
  language: string = 'en'
): Promise<TranscriptionResult> {
  try {
    // Download audio file
    const audioFilePath = await downloadAudioFromWhatsApp(mediaId, accessToken);
    
    if (!audioFilePath) {
      return {
        success: false,
        error: 'Failed to download audio file'
      };
    }

    // Transcribe audio
    const result = await transcribeAudio(audioFilePath, language);
    
    return result;
  } catch (error: any) {
    console.error('❌ Error in voice transcription:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if voice transcription is configured
 */
export function isTranscriptionConfigured(): boolean {
  // Check if any transcription service is configured
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.GOOGLE_SPEECH_API_KEY ||
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AZURE_SPEECH_KEY
  );
}
