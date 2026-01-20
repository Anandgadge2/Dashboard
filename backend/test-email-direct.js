/**
 * Direct Email Test
 * Tests email service without database
 * Run: node test-email-direct.js
 */

require('dotenv').config();
const { sendEmail, generateNotificationEmail } = require('./dist/services/emailService');

async function testEmail() {
  console.log('📧 Testing Email Service...\n');
  console.log('SMTP Config:');
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT}`);
  console.log(`  User: ${process.env.SMTP_USER}`);
  console.log(`  From: ${process.env.SMTP_FROM_NAME}\n`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials not configured in .env');
    process.exit(1);
  }

  // Test 1: Simple Email
  console.log('Test 1: Sending simple test email...');
  const result1 = await sendEmail(
    process.env.SMTP_USER, // Send to yourself for testing
    'Test Email from Grievance System',
    '<h1>Test Email</h1><p>This is a test email from the grievance notification system.</p>',
    'Test Email - This is a test email from the grievance notification system.'
  );
  console.log('Result:', result1);
  console.log('');

  // Test 2: Grievance Created Email
  console.log('Test 2: Sending grievance created email...');
  const emailTemplate = generateNotificationEmail('grievance', 'created', {
    companyName: 'Zilla Parishad Amravati',
    recipientName: 'Test Department Admin',
    grievanceId: 'GRV00000001',
    citizenName: 'Test Citizen',
    citizenPhone: '919356150561',
    departmentName: 'Water Supply Department',
    category: 'Water Supply',
    priority: 'HIGH',
    description: 'Test grievance description for email testing'
  });

  const result2 = await sendEmail(
    process.env.SMTP_USER,
    emailTemplate.subject,
    emailTemplate.html,
    emailTemplate.text
  );
  console.log('Result:', result2);
  console.log('');

  // Test 3: Grievance Resolved Email
  console.log('Test 3: Sending grievance resolved email...');
  const resolvedTemplate = generateNotificationEmail('grievance', 'resolved', {
    companyName: 'Zilla Parishad Amravati',
    citizenName: 'Test Citizen',
    grievanceId: 'GRV00000001',
    departmentName: 'Water Supply Department',
    remarks: 'Issue has been resolved successfully. Water supply restored.'
  });

  const result3 = await sendEmail(
    process.env.SMTP_USER,
    resolvedTemplate.subject,
    resolvedTemplate.html,
    resolvedTemplate.text
  );
  console.log('Result:', result3);
  console.log('');

  console.log('✅ Email tests completed!');
  console.log('📧 Check your email inbox (or Ethereal Email inbox)');
  console.log('🌐 Ethereal Email: https://ethereal.email');
  console.log(`   Login: ${process.env.SMTP_USER}`);
}

testEmail().catch(console.error);
