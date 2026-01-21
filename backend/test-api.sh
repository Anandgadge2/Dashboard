#!/bin/bash

# API Testing Script for Grievance System
# Usage: bash test-api.sh

BASE_URL="http://localhost:5000/api"
echo "🧪 Starting API Tests..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login as SuperAdmin
echo "1️⃣  Logging in as SuperAdmin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@platform.com",
    "password": "111111"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Step 2: Get Grievances
echo "2️⃣  Fetching grievances..."
curl -s -X GET "$BASE_URL/grievances" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 3: Get Users (to find operator ID)
echo "3️⃣  Fetching users..."
USERS=$(curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN")

echo "$USERS" | jq '.data.users[] | {id: ._id, name: .firstName, role: .role}' | head -20
echo ""

# Step 4: Get Departments
echo "4️⃣  Fetching departments..."
curl -s -X GET "$BASE_URL/departments" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.departments[] | {id: ._id, name: .name}' | head -10
echo ""

echo -e "${GREEN}✅ API Tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Create a grievance via WhatsApp chatbot"
echo "2. Assign it to an operator using the assignment endpoint"
echo "3. Update status to RESOLVED using status endpoint"
echo "4. Check notifications (email + WhatsApp)"
