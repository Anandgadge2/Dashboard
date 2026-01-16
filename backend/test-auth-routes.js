const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/auth";

// CHANGE THESE VALUES TO MATCH YOUR USER
const TEST_PHONE = "9356150561";
const TEST_PASSWORD = "password123"; // Change to your user's password

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║           AUTHENTICATION ROUTES TEST SCRIPT                ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

async function testNormalLogin() {
  console.log("📋 Test 1: Normal Login (Phone + Password)");
  console.log("─────────────────────────────────────────────────────────────");
  console.log(`Endpoint: POST ${BASE_URL}/login`);
  console.log(`Phone: ${TEST_PHONE}`);
  console.log(`Password: ${TEST_PASSWORD}`);
  console.log("");

  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      phone: TEST_PHONE,
      password: TEST_PASSWORD,
    });

    console.log("✅ SUCCESS!");
    console.log("");
    console.log("Response:");
    console.log(
      `  User: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`
    );
    console.log(`  Role: ${response.data.data.user.role}`);
    console.log(`  Phone: ${response.data.data.user.phone}`);
    console.log(`  Email: ${response.data.data.user.email || "N/A"}`);
    console.log(`  Active: ${response.data.data.user.isActive}`);
    console.log(
      `  Access Token: ${response.data.data.accessToken.substring(0, 30)}...`
    );
    console.log(
      `  Refresh Token: ${response.data.data.refreshToken.substring(0, 30)}...`
    );
    console.log("");

    return true;
  } catch (error) {
    console.log("❌ FAILED!");
    console.log("");
    if (error.response) {
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Message: ${error.response.data.message}`);
      if (error.response.data.error) {
        console.log(`  Error: ${error.response.data.error}`);
      }
    } else {
      console.log(`  Error: ${error.message}`);
      console.log("  Hint: Make sure backend server is running on port 5000");
    }
    console.log("");

    return false;
  }
}

async function testSSOLogin() {
  console.log("📋 Test 2: SSO Login (Phone Only - No Password)");
  console.log("─────────────────────────────────────────────────────────────");
  console.log(`Endpoint: POST ${BASE_URL}/sso/login`);
  console.log(`Phone: ${TEST_PHONE}`);
  console.log("Password: NOT REQUIRED");
  console.log("");

  try {
    const response = await axios.post(`${BASE_URL}/sso/login`, {
      phone: TEST_PHONE,
    });

    console.log("✅ SUCCESS!");
    console.log("");
    console.log("Response:");
    console.log(
      `  User: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`
    );
    console.log(`  Role: ${response.data.data.user.role}`);
    console.log(`  Phone: ${response.data.data.user.phone}`);
    console.log(`  Email: ${response.data.data.user.email || "N/A"}`);
    console.log(`  Active: ${response.data.data.user.isActive}`);
    console.log(
      `  Access Token: ${response.data.data.accessToken.substring(0, 30)}...`
    );
    console.log(
      `  Refresh Token: ${response.data.data.refreshToken.substring(0, 30)}...`
    );
    console.log("");

    return true;
  } catch (error) {
    console.log("❌ FAILED!");
    console.log("");
    if (error.response) {
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Message: ${error.response.data.message}`);
      if (error.response.data.error) {
        console.log(`  Error: ${error.response.data.error}`);
      }
    } else {
      console.log(`  Error: ${error.message}`);
      console.log("  Hint: Make sure backend server is running on port 5000");
    }
    console.log("");

    return false;
  }
}

async function runTests() {
  console.log("Starting tests...\n");

  const test1 = await testNormalLogin();
  console.log(
    "═════════════════════════════════════════════════════════════\n"
  );

  const test2 = await testSSOLogin();
  console.log(
    "═════════════════════════════════════════════════════════════\n"
  );

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                      TEST SUMMARY                          ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );
  console.log(
    `  Normal Login (Phone + Password): ${test1 ? "✅ PASSED" : "❌ FAILED"}`
  );
  console.log(
    `  SSO Login (Phone Only):          ${test2 ? "✅ PASSED" : "❌ FAILED"}`
  );
  console.log("");

  if (test1 && test2) {
    console.log("🎉 All tests passed! Both routes are working correctly.\n");
  } else {
    console.log("⚠️  Some tests failed. Check the errors above.\n");
    console.log("Common issues:");
    console.log("  1. Backend server not running (run: npm run dev)");
    console.log("  2. User does not exist in database");
    console.log("  3. Wrong password");
    console.log("  4. User account is inactive");
    console.log("");
  }
}

runTests();
