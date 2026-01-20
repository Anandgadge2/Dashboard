# Quick Testing Guide - Step by Step

## 🚀 Quick Start Testing

### Step 1: Start Backend Server

```bash
cd backend
npm run dev
```

**Verify:** You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

---

## 📋 Test Checklist

### ✅ Test 1: Email Service (5 minutes)

**Run:**
```bash
npm run test:email
```

**What to check:**
- ✅ No errors in console
- ✅ Go to https://ethereal.email
- ✅ Login: `savion.kuhic@ethereal.email` / `JDx7jMHV2JYBp46jcc`
- ✅ Check inbox for test emails

**Expected:** 3 test emails received

---

### ✅ Test 2: Complete Grievance Flow (10 minutes)

#### 2.1: Create Grievance via WhatsApp

**Option A: Real WhatsApp (Recommended)**
1. Open WhatsApp
2. Message your WhatsApp Business number: `Hi`
3. Follow chatbot:
   - Select language
   - Select "File Grievance"
   - Enter name: `Test User`
   - Select department
   - Enter description: `Testing grievance system`
   - Confirm

**Option B: Simulate Webhook**
```bash
# Use Postman or curl to POST to /webhook endpoint
# See TESTING_GUIDE.md for webhook payload
```

**Verify in Database:**
```javascript
// MongoDB
db.grievances.find().sort({createdAt: -1}).limit(1).pretty()
```

**Check Logs:**
- ✅ `✅ Grievance created: { grievanceId: 'GRV...' }`
- ✅ `✅ Notified department admin ... about new grievance`

**Check Notifications:**
- ✅ Department Admin email received
- ✅ Department Admin WhatsApp received

---

#### 2.2: Assign to Operator

**Step 1: Login as Department Admin**
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "revenue.admin@zpamaravati.gov.in",
  "password": "your-password"
}
```

**Copy the `accessToken`**

**Step 2: Get Grievance ID**
```bash
GET http://localhost:5000/api/grievances
Authorization: Bearer <token>
```

**Copy the `_id` of the grievance**

**Step 3: Get Operator User ID**
```bash
GET http://localhost:5000/api/users?role=OPERATOR
Authorization: Bearer <token>
```

**Copy the operator's `_id`**

**Step 4: Assign Grievance**
```bash
PUT http://localhost:5000/api/assignments/grievance/<grievance-id>/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignedTo": "<operator-user-id>"
}
```

**Verify:**
- ✅ Check logs: `✅ Notified user ... about grievance assignment`
- ✅ Operator email received
- ✅ Operator WhatsApp received

---

#### 2.3: Update Status to RESOLVED

**Step 1: Login as Operator**
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "operator@example.com",
  "password": "password"
}
```

**Step 2: Update Status**
```bash
PUT http://localhost:5000/api/status/grievance/<grievance-id>
Authorization: Bearer <operator-token>
Content-Type: application/json

{
  "status": "RESOLVED",
  "remarks": "Issue resolved successfully. Water supply restored."
}
```

**Verify:**
- ✅ Check logs: `✅ Notified citizen ... about grievance resolution`
- ✅ Check logs: `✅ Notified X users in hierarchy about status change`
- ✅ Citizen WhatsApp received (check the phone number used in grievance)
- ✅ Company Admin email received
- ✅ Department Admin email received
- ✅ Operator email received (assigned user)
- ✅ All hierarchy WhatsApp received

---

## 🔍 Verification Points

### Database Verification

```javascript
// Check grievance exists
db.grievances.findOne({grievanceId: "GRV00000001"})

// Check status history
db.grievances.findOne({grievanceId: "GRV00000001"}, {statusHistory: 1})

// Check timeline (assignment logs)
db.grievances.findOne({grievanceId: "GRV00000001"}, {timeline: 1})

// Should see:
// - CREATED action
// - ASSIGNED action (if assigned)
// - STATUS_UPDATED action
```

### Email Verification

1. **Ethereal Email:**
   - Go to: https://ethereal.email
   - Login: `savion.kuhic@ethereal.email` / `JDx7jMHV2JYBp46jcc`
   - Check inbox for all notification emails

2. **Check Email Logs:**
   - Look for: `✅ Email sent to ...`
   - Or errors: `❌ Failed to send email`

### WhatsApp Verification

1. **Check Logs:**
   - Look for: `✅ WhatsApp text sent → <phone-number>`
   - Or errors: `❌ WhatsApp API Error`

2. **Check Phone:**
   - Verify messages received on configured phone numbers
   - Check message format and content

---

## 🐛 Troubleshooting

### No Email Received?
1. Check `.env` SMTP settings
2. Check Ethereal Email inbox
3. Check email service logs
4. Verify user has email in database

### No WhatsApp Received?
1. Check `.env` WhatsApp credentials
2. Check phone number format (include country code: 91...)
3. Check WhatsApp API logs
4. Verify company has WhatsApp config

### Grievance Not Created?
1. Check database connection
2. Check chatbot logs
3. Verify department exists
4. Check for validation errors

### Assignment Not Working?
1. Verify user has `ASSIGN_GRIEVANCE` permission
2. Check user exists and is active
3. Check department matches
4. Check assignment logs

### Status Update Not Working?
1. Verify user has `STATUS_CHANGE_GRIEVANCE` permission
2. Check status value is valid
3. Check department/company access
4. Check notification logs

---

## 📊 Expected Results

### After Grievance Creation:
- ✅ 1 record in `grievances` collection
- ✅ 1 email to Department Admin
- ✅ 1 WhatsApp to Department Admin
- ✅ Timeline entry: `CREATED`

### After Assignment:
- ✅ Grievance `assignedTo` field updated
- ✅ 1 email to Operator
- ✅ 1 WhatsApp to Operator
- ✅ Timeline entry: `ASSIGNED`

### After Status = RESOLVED:
- ✅ Grievance `status` = `RESOLVED`
- ✅ Status history updated
- ✅ 1 WhatsApp to Citizen
- ✅ 3 emails (Company Admin, Dept Admin, Operator)
- ✅ 3 WhatsApp (Company Admin, Dept Admin, Operator)
- ✅ Timeline entry: `STATUS_UPDATED`

---

## 🎯 Success Criteria

All tests pass if:
- ✅ Grievance stored in database
- ✅ Department Admin gets email + WhatsApp on creation
- ✅ Operator gets email + WhatsApp on assignment
- ✅ Citizen gets WhatsApp on resolution
- ✅ Hierarchy gets email + WhatsApp on resolution
- ✅ All data visible in database
- ✅ Timeline/assignment logs tracked
- ✅ Permissions enforced correctly

---

## 📝 Quick Commands

```bash
# Test email service
npm run test:email

# Test notifications (requires DB)
npm run test:notifications

# Build before testing
npm run build

# Check logs
tail -f logs/combined.log

# Check errors
tail -f logs/error.log
```

---

## 🔗 Useful Links

- **Ethereal Email:** https://ethereal.email
- **WhatsApp API Docs:** https://developers.facebook.com/docs/whatsapp
- **MongoDB Compass:** For database inspection
- **Postman Collection:** Import API endpoints for testing

---

## 💡 Pro Tips

1. **Use Postman/Thunder Client** for API testing
2. **Keep MongoDB Compass open** to watch data changes
3. **Monitor logs in real-time** while testing
4. **Test one feature at a time** for easier debugging
5. **Use test phone numbers** for WhatsApp testing
6. **Check Ethereal Email regularly** during testing
