# 📱 Complete Guide: Making Your Custom Chatbot Flow Work with WhatsApp

## ✅ **Current Status: IT SHOULD BE WORKING!**

The system is already set up to work. When you:
1. ✅ Create/Edit a flow
2. ✅ Save the changes
3. ✅ Click "Assign to WhatsApp"

The flow **should automatically work** with WhatsApp. Here's how it works and how to ensure it's set up correctly.

---

## 🔄 **How It Works (Technical Flow)**

### **Step 1: Flow Creation/Editing**
- You create or edit a flow in the dashboard
- Flow is saved to database with all steps, triggers, and configurations
- Flow status: `isActive: false` (initially)

### **Step 2: Assign to WhatsApp**
When you click "Assign to WhatsApp":
1. ✅ Flow is added to `CompanyWhatsAppConfig.activeFlows[]`
2. ✅ Flow is activated (`isActive: true`)
3. ✅ Other flows for the same company are deactivated
4. ✅ Flow is now ready to receive messages

### **Step 3: User Sends "hi" to WhatsApp**
1. ✅ WhatsApp webhook receives the message
2. ✅ System identifies the company by phone number ID
3. ✅ System searches for flows with trigger "hi" for that company
4. ✅ Finds your active flow
5. ✅ Executes the first step (e.g., language selection)
6. ✅ User sees the flow in action!

---

## 📋 **Step-by-Step Setup Instructions**

### **Prerequisites Checklist**

Before creating a flow, ensure:

- [ ] **WhatsApp Configuration is Set Up**
  - Go to: **Company** → **WhatsApp Config**
  - Fill in:
    - Phone Number ID
    - Access Token
    - Phone Number
  - Click **Save**
  - Verify it shows as **Active**

- [ ] **Company is Active**
  - Company should be active in the system
  - Company should have the correct phone number ID linked

---

### **Step 1: Create Your Flow**

1. **Navigate to Flow Creation:**
   - Go to: **SuperAdmin Dashboard** → **Company** → **[Your Company]**
   - Click **"Customize Chatbot"** button
   - Click **"Create New Flow"** button

2. **Configure Basic Information:**
   - **Flow Name:** Give it a descriptive name (e.g., "Jharsuguda Complete Flow")
   - **Description:** Describe what the flow does
   - **Flow Type:** Select "Custom"

3. **Add Triggers:**
   - Click **"Add Trigger"**
   - **Trigger Type:** Select "Keyword/Message"
   - **Trigger Value:** Enter "hi" (and optionally "hello", "start", "namaste")
   - Repeat for each trigger word you want

4. **Create Steps:**
   - Click **"Add Step"**
   - **Step 1 (Language Selection):**
     - Step ID: `language_selection`
     - Step Type: **Interactive Buttons**
     - Message Text: Your welcome message
     - Add Buttons:
       - Button ID: `lang_en`, Text: "🇬🇧 English"
       - Button ID: `lang_hi`, Text: "🇮🇳 हिंदी"
       - Button ID: `lang_or`, Text: "🇮🇳 ଓଡ଼ିଆ"
     - **Expected Responses:**
       - Add Response for each button:
         - Response Type: **Button Click**
         - Expected Value: `lang_en` (or `lang_hi`, `lang_or`)
         - Next Step ID: `main_menu`
     - **Default Next Step ID:** `main_menu`

   - **Step 2 (Main Menu):**
     - Step ID: `main_menu`
     - Step Type: **Interactive Buttons**
     - Message Text: Your main menu message
     - Add Buttons:
       - Button ID: `grievance`, Text: "📝 File Grievance"
       - Button ID: `appointment`, Text: "📅 Book Appointment"
       - Button ID: `track`, Text: "🔍 Track Status"
     - **Expected Responses:**
       - Add Response for each button with appropriate Next Step ID
     - **Default Next Step ID:** (leave empty or set fallback)

   - Continue adding steps as needed...

5. **Set Start Step:**
   - In the flow's basic information section
   - **Start Step ID:** Set to your first step's ID (e.g., `language_selection`)

6. **Save the Flow:**
   - Click **"Save Flow"** button
   - Wait for success message
   - Flow is now saved in database

---

### **Step 2: Assign Flow to WhatsApp**

1. **Go to Chatbot Flows Page:**
   - From Company page, click **"Customize Chatbot"**
   - You should see your flow in the list

2. **Verify Flow Status:**
   - Flow should show in the list
   - Check that it has:
     - ✅ Triggers configured (e.g., "hi", "hello")
     - ✅ At least one step
     - ✅ Start Step ID set

3. **Assign to WhatsApp:**
   - Click **"Assign to WhatsApp"** button on your flow
   - Wait for success toast: "Flow assigned to WhatsApp configuration successfully"
   - The button should change to **"Assigned"** (blue button with checkmark)

4. **Verify Assignment:**
   - The flow should now show as **"Assigned"**
   - Flow should show **"✓ ACTIVE"** badge (green)
   - In backend logs, you should see: `✅ Flow activated: [Flow ID]`

---

### **Step 3: Test the Flow**

1. **Send Test Message:**
   - Open WhatsApp
   - Send "hi" to your WhatsApp Business number
   - Wait for response (should be within 1-2 seconds)

2. **Expected Behavior:**
   - ✅ Bot should respond with your welcome message
   - ✅ Bot should show language selection buttons
   - ✅ Clicking a language button should proceed to next step

3. **Check Backend Logs:**
   Look for these log messages:
   ```
   🔍 Searching for flow with trigger "hi" for company: ...
   ✅ Found flow: [Your Flow Name] ([Flow ID]) for trigger: hi
   🚀 Executing flow step: language_selection (buttons)
   ✅ WhatsApp buttons sent → [phone number]
   ```

4. **If Flow Doesn't Work:**
   - Check backend console for errors
   - Verify flow is active and assigned
   - Check that triggers are configured correctly
   - Verify Start Step ID matches first step's stepId

---

## 🔍 **Troubleshooting**

### **Issue 1: Flow Not Responding to "hi"**

**Symptoms:**
- User sends "hi" but gets no response or default language selection

**Check:**
1. ✅ Flow is saved in database
2. ✅ Flow `isActive: true`
3. ✅ Flow has trigger "hi" configured
4. ✅ Flow is assigned to WhatsApp config
5. ✅ Start Step ID is set correctly
6. ✅ First step exists and has valid stepId

**Fix:**
- Re-assign the flow: Click "Assigned" → then "Assign to WhatsApp" again
- Check backend logs for flow loading errors
- Verify company ID matches between flow and WhatsApp config

---

### **Issue 2: Flow Starts But Doesn't Progress**

**Symptoms:**
- Language selection appears
- Clicking buttons doesn't advance the flow

**Check:**
1. ✅ Expected Responses are configured for buttons
2. ✅ Next Step ID is set in Expected Responses
3. ✅ Next step exists in the flow
4. ✅ Step IDs match exactly (case-sensitive)

**Fix:**
- Edit the flow
- Check Expected Responses section for each button
- Ensure Next Step ID matches the actual step ID
- Save and re-assign

---

### **Issue 3: "Flow Not Found" Error**

**Symptoms:**
- Backend logs show: `⚠️ No flow found for trigger "hi"`

**Check:**
1. ✅ Flow exists for the correct company
2. ✅ Flow is active (`isActive: true`)
3. ✅ Trigger value matches exactly (case-insensitive, but check spelling)
4. ✅ Company ID matches

**Fix:**
- Verify company ID in flow matches the company
- Check trigger values are saved correctly
- Re-assign the flow

---

### **Issue 4: "Start Step Not Found" Error**

**Symptoms:**
- Backend logs show: `❌ Start step "..." not found in flow!`

**Check:**
1. ✅ Start Step ID is set in flow settings
2. ✅ A step with that exact stepId exists
3. ✅ Step IDs don't have typos

**Fix:**
- Edit the flow
- Check Start Step ID matches first step's stepId exactly
- Save and re-assign

---

## ✅ **Verification Checklist**

Before testing, verify:

- [ ] WhatsApp Config is active and configured
- [ ] Flow is created and saved
- [ ] Flow has at least one trigger (e.g., "hi")
- [ ] Flow has at least one step
- [ ] Start Step ID is set to first step's stepId
- [ ] Flow is assigned to WhatsApp (shows "Assigned" button)
- [ ] Flow shows "✓ ACTIVE" badge
- [ ] Backend server is running
- [ ] Webhook is configured and receiving messages

---

## 🎯 **Quick Test Procedure**

1. **Create a Simple Test Flow:**
   ```
   Step 1: language_selection (Buttons)
     - Message: "Welcome! Select language:"
     - Buttons: lang_en, lang_hi
     - Expected Response: lang_en → main_menu
     - Default Next: main_menu
   
   Step 2: main_menu (Message)
     - Message: "You selected English! Flow is working!"
   ```

2. **Save and Assign:**
   - Save the flow
   - Click "Assign to WhatsApp"

3. **Test:**
   - Send "hi" to WhatsApp
   - Should see welcome message with buttons
   - Click "English"
   - Should see "You selected English! Flow is working!"

---

## 📊 **Backend Logs to Watch For**

When everything works correctly, you'll see:

```
📥 Webhook POST received
🔍 Processing WhatsApp message: { companyId: '...', from: '...', messageText: 'hi' }
✅ Company found: [Company Name] (CMP000001)
🔄 Global reset triggered by greeting: hi
🔍 Searching for flow with trigger "hi" for company: ...
✅ Found flow: [Flow Name] ([Flow ID]) for trigger: hi
   Start Step ID: language_selection
   Total Steps: 2
🚀 Executing flow step: language_selection (buttons)
🔄 Executing step: Language Selection (buttons)
✅ WhatsApp buttons sent → [phone number]
```

---

## 🚀 **Advanced: Multiple Flows**

If you have multiple flows:

1. **Only one flow can be active per company**
2. **When you assign a flow, others are automatically deactivated**
3. **The active flow is the one that responds to triggers**

To switch flows:
- Assign the new flow (automatically deactivates old one)
- Or manually activate/deactivate flows

---

## 📝 **Important Notes**

1. **Flow Assignment = Activation:**
   - Assigning a flow automatically activates it
   - Only active flows respond to triggers

2. **Trigger Matching:**
   - Triggers are case-insensitive
   - "hi", "Hi", "HI" all match trigger "hi"
   - Exact word match (not substring)

3. **Step IDs Must Be Unique:**
   - Each step must have a unique stepId
   - Step IDs are case-sensitive
   - Use lowercase with underscores (e.g., `language_selection`)

4. **Expected Responses Priority:**
   - Expected Responses are checked first
   - Then buttonMapping (from button.nextStepId)
   - Then step's default nextStepId

---

## 🎉 **Success Indicators**

You'll know it's working when:

- ✅ User sends "hi" → Gets your custom welcome message
- ✅ User clicks language button → Flow progresses to next step
- ✅ Backend logs show flow execution
- ✅ No errors in console
- ✅ Flow responds within 1-2 seconds

---

## 🆘 **Still Not Working?**

If after following all steps it still doesn't work:

1. **Check Backend Console:**
   - Look for any `❌` or `⚠️` messages
   - Share the logs

2. **Verify Database:**
   - Check if flow exists: `db.chatbotflows.find({ flowName: "..." })`
   - Check if flow is active: `isActive: true`
   - Check triggers: `triggers: [{ triggerValue: "hi" }]`

3. **Test Webhook:**
   - Verify webhook is receiving messages
   - Check company resolution is working

4. **Contact Support:**
   - Share backend logs
   - Share flow configuration
   - Share WhatsApp config details (without tokens)

---

**🎯 The system is designed to work automatically once you assign a flow. If it's not working, it's usually a configuration issue that can be fixed by checking the checklist above.**
