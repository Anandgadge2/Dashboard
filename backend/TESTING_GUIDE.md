# Complete Testing Guide - Grievance & Appointment System

## Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   npm run dev
   ```
   Should see: `🚀 Server running on port 5000`

2. **Database Connected**
   - MongoDB should be connected
   - Check logs for: `✅ MongoDB connected`

3. **Environment Variables Set**
   - SMTP configured in `.env`
   - WhatsApp credentials configured
   - JWT secret set

4. **Test Users Created**
   - SuperAdmin
   - Company Admin
   - Department Admin
   - Operator

---

## Test Scenario 1: Complete Grievance Flow

### Step 1: Create Grievance via WhatsApp Chatbot

**Method 1: Using WhatsApp Business API (Real)**
1. Open WhatsApp on your phone
2. Send message to your WhatsApp Business number: `Hi`
3. Follow the chatbot flow:
   - Select language (English/Hindi/Marathi)
   - Select "File Grievance"
   - Enter your name
   - Select department
   - Enter description
   - Confirm submission

**Method 2: Simulate via API (For Testing)**
```bash
# Simulate webhook POST request
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "1753824395297105",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551944395",
            "phone_number_id": "855499764321956"
          },
          "messages": [{
            "from": "919356150561",
            "id": "wamid.test123",
            "timestamp": "1234567890",
            "type": "text",
            "text": {
              "body": "Hi"
            }
          }]
        }
      }]
    }]
  }'
```

### Step 2: Verify Grievance Created

**Check Database:**
```bash
# Connect to MongoDB and check
db.grievances.find().sort({createdAt: -1}).limit(1).pretty()
```

**Check Logs:**
- Should see: `✅ Grievance created: { grievanceId: 'GRV00000001', _id: ... }`
- Should see: `✅ Notified department admin ... about new grievance`

**Verify Notifications:**
- Check Department Admin's email inbox
- Check Department Admin's WhatsApp (if phone number configured)

---

## Test Scenario 2: Assignment Flow

### Step 1: Login as Department Admin

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "revenue.admin@zpamaravati.gov.in",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### Step 2: Get List of Grievances

```bash
GET http://localhost:5000/api/grievances
Authorization: Bearer <department-admin-token>
```

### Step 3: Assign Grievance to Operator

```bash
PUT http://localhost:5000/api/assignments/grievance/<grievance-id>/assign
Authorization: Bearer <department-admin-token>
Content-Type: application/json

{
  "assignedTo": "<operator-user-id>"
}
```

**Verify:**
- Check logs: `✅ Notified user ... about grievance assignment`
- Check Operator's email inbox
- Check Operator's WhatsApp

---

## Test Scenario 3: Status Update Flow

### Step 1: Login as Operator

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "operator@example.com",
  "password": "password"
}
```

### Step 2: Update Status to RESOLVED

```bash
PUT http://localhost:5000/api/status/grievance/<grievance-id>
Authorization: Bearer <operator-token>
Content-Type: application/json

{
  "status": "RESOLVED",
  "remarks": "Issue has been resolved. Water supply restored successfully."
}
```

**Verify:**
- Check logs: `✅ Notified citizen ... about grievance resolution`
- Check logs: `✅ Notified X users in hierarchy about status change`
- Check Citizen's WhatsApp (should receive resolution message)
- Check Company Admin's email
- Check Department Admin's email
- Check Operator's email (assigned user)
- Check all hierarchy members' WhatsApp

---

## Test Scenario 4: Permission Testing

### Test Operator Restrictions

**Try Full Update (Should Fail):**
```bash
PUT http://localhost:5000/api/grievances/<grievance-id>
Authorization: Bearer <operator-token>
Content-Type: application/json

{
  "description": "Trying to change description"
}
```

**Expected:** `403 Forbidden - Operators can only update status and remarks`

**Try Status Update (Should Work):**
```bash
PUT http://localhost:5000/api/status/grievance/<grievance-id>
Authorization: Bearer <operator-token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "remarks": "Working on it"
}
```

**Expected:** `200 OK - Status updated successfully`

---

## Test Scenario 5: Multi-Language Testing

### Test English Flow
1. Send: `Hi` → Select `🇬🇧 English`
2. Complete grievance flow
3. Verify all messages in English

### Test Hindi Flow
1. Send: `Hi` → Select `🇮🇳 हिंदी`
2. Complete grievance flow
3. Verify all messages in Hindi

### Test Marathi Flow
1. Send: `Hi` → Select `🇮🇳 मराठी`
2. Complete grievance flow
3. Verify all messages in Marathi

---

## Test Scenario 6: Email Notifications

### Check Email Service

**Test Email Sending Directly:**
```bash
# Create a test script: backend/test-email.js
const { sendEmail } = require('./src/services/emailService');

sendEmail(
  'test@example.com',
  'Test Email',
  '<h1>Test</h1>',
  'Test'
).then(result => console.log(result));
```

**Run:**
```bash
node backend/test-email.js
```

**Check Ethereal Email:**
1. Go to: https://ethereal.email
2. Login with: `savion.kuhic@ethereal.email` / `JDx7jMHV2JYBp46jcc`
3. Check inbox for test emails

---

## Test Scenario 7: WhatsApp Notifications

### Check WhatsApp Service

**Test WhatsApp Sending:**
```bash
# Check logs when notifications are sent
# Look for: ✅ WhatsApp text sent → <phone-number>
# Or errors: ❌ WhatsApp API Error
```

**Verify WhatsApp Messages:**
- Check the phone number that should receive messages
- Verify message format and content
- Check for any errors in logs

---

## Test Scenario 8: Database Verification

### Check All Data is Stored

```javascript
// MongoDB Queries

// 1. Check grievances
db.grievances.find().pretty()

// 2. Check appointments
db.appointments.find().pretty()

// 3. Check status history
db.grievances.findOne({grievanceId: "GRV00000001"}, {statusHistory: 1})

// 4. Check timeline (assignment logs)
db.grievances.findOne({grievanceId: "GRV00000001"}, {timeline: 1})

// 5. Check notifications sent (check logs or create notification log collection)
```

---

## Test Scenario 9: Visibility Restrictions

### Test Department Isolation

1. **Login as Department Admin A**
   - Get grievances: Should only see Department A grievances

2. **Login as Department Admin B**
   - Get grievances: Should only see Department B grievances
   - Try to access Department A grievance: Should fail

3. **Login as Operator**
   - Get grievances: Should only see assigned grievances

4. **Login as Company Admin**
   - Get grievances: Should see all company grievances

---

## Test Scenario 10: Complete End-to-End Flow

### Full Workflow Test

1. **Citizen creates grievance via WhatsApp**
   - ✅ Grievance stored
   - ✅ Department Admin notified (Email + WhatsApp)

2. **Department Admin assigns to Operator**
   - ✅ Assignment logged in timeline
   - ✅ Operator notified (Email + WhatsApp)

3. **Operator updates status to IN_PROGRESS**
   - ✅ Status updated
   - ✅ Status history updated

4. **Operator updates status to RESOLVED**
   - ✅ Status updated
   - ✅ Citizen notified (WhatsApp)
   - ✅ Hierarchy notified (Email + WhatsApp)

---

## Quick Test Checklist

- [ ] Backend server running
- [ ] Database connected
- [ ] SMTP configured
- [ ] WhatsApp credentials configured
- [ ] Test users created
- [ ] Grievance creation works
- [ ] Department admin receives email
- [ ] Department admin receives WhatsApp
- [ ] Assignment works
- [ ] Operator receives email on assignment
- [ ] Operator receives WhatsApp on assignment
- [ ] Status update works
- [ ] Citizen receives WhatsApp on resolution
- [ ] Hierarchy receives email on resolution
- [ ] Hierarchy receives WhatsApp on resolution
- [ ] Operator restrictions work
- [ ] Multi-language works
- [ ] Database stores all data
- [ ] Timeline/assignment logs work
- [ ] Visibility restrictions work

---

## Debugging Tips

### Check Logs
```bash
# Backend logs show all notifications
tail -f backend/logs/combined.log

# Look for:
# ✅ Notified department admin...
# ✅ Notified user... about assignment
# ✅ Notified citizen... about resolution
# ✅ Notified X users in hierarchy...
```

### Check Email Service
- Verify SMTP credentials in `.env`
- Check Ethereal Email inbox
- Check email service logs

### Check WhatsApp Service
- Verify WhatsApp credentials in `.env`
- Check WhatsApp API logs
- Verify phone number format (with country code)

### Check Database
- Verify MongoDB connection
- Check if data is being saved
- Verify relationships (companyId, departmentId, assignedTo)

---

## Common Issues & Solutions

### Issue: No email received
- **Check:** SMTP credentials in `.env`
- **Check:** Email service logs
- **Check:** User has email in database

### Issue: No WhatsApp received
- **Check:** WhatsApp credentials in `.env`
- **Check:** Phone number format (should include country code)
- **Check:** WhatsApp API logs for errors

### Issue: Operator can update full grievance
- **Check:** Using `/status` endpoint, not `/:id` endpoint
- **Check:** Operator has `STATUS_CHANGE_GRIEVANCE` permission

### Issue: Notifications not sent
- **Check:** Department admin exists for department
- **Check:** User has email/phone configured
- **Check:** Company has WhatsApp config

---

## Test Data Setup

### Create Test Users

```bash
# Run seed scripts
npm run seed:superadmin
npm run seed:zpamaravati
npm run seed:users
```

### Create Test Departments

```bash
npm run seed:departments
```

---

## Automated Testing (Optional)

Create test scripts in `backend/tests/`:

```javascript
// test-notifications.js
const { notifyDepartmentAdminOnCreation } = require('../src/services/notificationService');

// Test notification service
async function testNotifications() {
  await notifyDepartmentAdminOnCreation({
    type: 'grievance',
    action: 'created',
    grievanceId: 'GRV00000001',
    citizenName: 'Test User',
    citizenPhone: '919356150561',
    departmentId: '...',
    companyId: '...',
    description: 'Test grievance'
  });
}
```

---

## Success Criteria

✅ All notifications sent successfully
✅ All data stored in database
✅ Permissions enforced correctly
✅ Multi-language working
✅ Visibility restrictions working
✅ Assignment logs tracked
✅ Status updates working
✅ Citizen receives resolution notification
✅ Hierarchy receives resolution notifications
