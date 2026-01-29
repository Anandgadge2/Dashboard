import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is required. Set it in .env or environment.');
  process.exit(1);
}

// This is what the MAIN DASHBOARD will send in the JWT token
// The token should contain at minimum the user's phone number
const ssoPayload = {
  phone: '9021550841', 
  source: "MAIN_DASHBOARD",
};

// Generate the SSO token (this is what the main dashboard does)
const ssoToken = jwt.sign(ssoPayload, JWT_SECRET as string);

// Decode to show what's inside (for verification)
const decoded = jwt.decode(ssoToken);

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║          SSO TOKEN GENERATOR - MAIN DASHBOARD             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📋 Token Payload (what the main dashboard encodes):');
console.log(JSON.stringify(ssoPayload, null, 2));

console.log('\n🔐 Generated SSO Token:');
console.log(ssoToken);

console.log('\n🔍 Decoded Token (for verification):');
console.log(JSON.stringify(decoded, null, 2));

console.log('\n🌐 Test URL for Auto-Login:');
console.log(`http://localhost:3000/auth/sso?token=${ssoToken}`);

console.log('\n📝 How it works:');
console.log('1. Main dashboard generates JWT token with user phone');
console.log('2. Main dashboard redirects to: http://localhost:3000/auth/sso?token=JWT_TOKEN');
console.log('3. This dashboard receives the token');
console.log('4. Backend decodes the token using JWT_SECRET');
console.log('5. Backend finds user by phone number');
console.log('6. Backend generates new access/refresh tokens');
console.log('7. User is automatically logged in!');

console.log('\n✅ Both dashboards must share the same JWT_SECRET!\n');

