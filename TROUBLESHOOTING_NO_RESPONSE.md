# 🔧 Troubleshooting: No Response After Sending "Hi"

## 🚨 Quick Checklist

When you send "hi" to the WhatsApp number and get no response, check these in order:

### ✅ **1. Check Backend Logs**

Look for these log messages in your backend console:

```
🔍 Processing WhatsApp message: { companyId: '...', from: '...', messageType: 'text', messageText: 'hi' }
✅ Company found: { name: '...', _id: '...', companyId: '...' }
🔄 Global reset triggered by greeting: hi
🔍 Searching for flow with trigger "hi" for company: ...
```

**If you see:**
- `❌ Company not found` → WhatsApp config issue
- `⚠️ No flow found for trigger "hi"` → Flow not created or trigger not configured
- `❌ Flow configuration error` → Flow has missing startStepId or step

---

## 🔍 **2. Verify Flow Exists and is Active**

### **Check in Dashboard:**
1. Go to **SuperAdmin Dashboard** → **Company** → **Your Company**
2. Click **"Customize Chatbot"** button
3. Check if you have a flow listed
4. Verify the flow shows **"✓ ACTIVE"** badge (green)

### **Check Flow Triggers:**
1. Click **"View"** on your flow
2. Verify **"hi"** is listed in the triggers
3. Check that trigger type is **"Keyword/Message"**

### **Check Flow Steps:**
1. Verify the flow has at least **1 step**
2. Check that **Start Step ID** is set correctly
3. Verify the first step exists and has a valid `stepId`

---

## 🔧 **3. Common Issues and Fixes**

### **Issue 1: No Flow Created**
**Symptom:** Backend logs show `⚠️ No flow found for trigger "hi"`

**Fix:**
1. Create a new flow from the dashboard
2. Add trigger "hi" (and "hello", "start" for better UX)
3. Create at least one step (e.g., language selection)
4. Set the first step's `stepId` as the `startStepId`
5. **Save and Activate** the flow

---

### **Issue 2: Flow Not Active**
**Symptom:** Flow exists but shows inactive status

**Fix:**
1. Go to **Chatbot Flows** page
2. Find your flow
3. Click the **Play/Pause** button to activate it
4. Or click **"Assign to WhatsApp"** button

---

### **Issue 3: Trigger Not Configured**
**Symptom:** Flow exists but "hi" trigger is missing

**Fix:**
1. Click **"Edit"** on your flow
2. Scroll to **"🎯 Flow Triggers"** section
3. Click **"Add Trigger"**
4. Set:
   - **Trigger Type:** `Keyword/Message`
   - **Trigger Value:** `hi`
5. **Save** the flow

---

### **Issue 4: Missing Start Step ID**
**Symptom:** Backend logs show `❌ Flow has no startStepId configured!`

**Fix:**
1. Edit your flow
2. Check that the first step has a valid `stepId` (e.g., `language_selection`)
3. In the flow's basic info, ensure **Start Step ID** is set to the first step's ID
4. **Save** the flow

---

### **Issue 5: Step ID Mismatch**
**Symptom:** Backend logs show `❌ Start step "..." not found in flow!`

**Fix:**
1. Check the **Start Step ID** in flow settings
2. Verify a step with that exact `stepId` exists
3. Fix the `stepId` or update the Start Step ID to match
4. **Save** the flow

---

### **Issue 6: WhatsApp Config Not Set**
**Symptom:** Backend logs show `❌ Company not found` or `⚠️ No WhatsApp config found`

**Fix:**
1. Go to **Company** → **WhatsApp Config**
2. Fill in all required fields:
   - Phone Number ID
   - Access Token
   - Phone Number
3. **Save** the configuration
4. Verify it shows as **Active**

---

### **Issue 7: Wrong Company ID**
**Symptom:** Flow exists but for different company

**Fix:**
1. Check which company the flow belongs to
2. Verify the WhatsApp number is linked to the correct company
3. Create a new flow for the correct company if needed

---

## 🧪 **4. Test Flow Setup**

### **Step-by-Step Test:**

1. **Send "hi" to WhatsApp number**
2. **Check backend logs** for:
   ```
   🔍 Searching for flow with trigger "hi" for company: ...
   📊 Total flows for company: X
   ✅ Found flow: [Flow Name] ([Flow ID]) for trigger: hi
   🚀 Executing flow step: [stepId] ([stepType])
   ✅ WhatsApp buttons sent → [phone number]
   ```

3. **If you see errors:**
   - Note the exact error message
   - Check the troubleshooting section above
   - Fix the issue and try again

---

## 📋 **5. Verify Flow Configuration**

### **Required Flow Setup:**

```
Flow Name: [Your Flow Name]
Flow Type: custom
Is Active: ✅ YES
Start Step ID: [First step's stepId, e.g., "language_selection"]

Triggers:
  - Type: keyword
    Value: hi
    Start Step ID: [First step's stepId]

Steps:
  Step 1:
    Step ID: language_selection
    Step Type: Interactive Buttons
    Message Text: [Welcome message]
    Buttons:
      - ID: lang_en, Text: 🇬🇧 English
      - ID: lang_hi, Text: 🇮🇳 हिंदी
      - ID: lang_or, Text: 🇮🇳 ଓଡ଼ିଆ
    Expected Responses:
      - Type: button_click, Value: lang_en, Next Step: main_menu
      - Type: button_click, Value: lang_hi, Next Step: main_menu
      - Type: button_click, Value: lang_or, Next Step: main_menu
    Default Next Step: main_menu
```

---

## 🔍 **6. Debug Commands**

### **Check Backend Logs:**
Look for these specific log patterns:

**✅ Good Logs (Flow Working):**
```
🔄 Global reset triggered by greeting: hi
🔍 Searching for flow with trigger "hi" for company: ...
✅ Found flow: [Name] ([ID]) for trigger: hi
🚀 Executing flow step: language_selection (buttons)
✅ WhatsApp buttons sent → [phone]
```

**❌ Bad Logs (Flow Not Working):**
```
⚠️ No flow found for trigger "hi" in company ...
⚠️ No custom flow found for trigger "hi", using default language selection
❌ Flow has no startStepId configured!
❌ Start step "..." not found in flow!
```

---

## 🛠️ **7. Quick Fixes**

### **Fix 1: Re-activate Flow**
1. Go to **Chatbot Flows** page
2. Click **"Assign to WhatsApp"** on your flow
3. This will activate it and assign it to WhatsApp config

### **Fix 2: Re-create Flow**
If flow is corrupted:
1. **View** the existing flow to copy settings
2. **Create New Flow** with same configuration
3. **Delete** the old flow
4. **Activate** the new flow

### **Fix 3: Check Database**
If you have database access:
```javascript
// Check if flow exists
db.chatbotflows.find({ 
  companyId: ObjectId("..."), 
  isActive: true,
  "triggers.triggerValue": /^hi$/i 
})

// Check flow details
db.chatbotflows.findOne({ flowId: "FLOW000001" })
```

---

## 📞 **8. Still Not Working?**

If none of the above fixes work:

1. **Check backend console** for the exact error
2. **Share the logs** showing:
   - Company lookup
   - Flow search
   - Any error messages
3. **Verify:**
   - Flow is saved in database
   - Flow `isActive: true`
   - Flow has valid `startStepId`
   - Flow has at least one step
   - Trigger "hi" is configured correctly

---

## ✅ **Expected Behavior**

When everything is configured correctly:

1. **User sends:** "hi"
2. **System:**
   - Finds company by phone number ID
   - Searches for flow with trigger "hi"
   - Finds and loads the flow
   - Executes first step (e.g., language selection)
   - Sends WhatsApp message with buttons
3. **User sees:** Language selection buttons
4. **User clicks:** Language button (e.g., "🇬🇧 English")
5. **System:** Routes to next step (e.g., main menu)

---

**🎯 The most common issue is: Flow exists but is not activated, or trigger "hi" is not configured in the flow.**
