# 🏛️ Complete Guide: Setting Up Jharsuguda Chatbot Flow

## ✅ How It Works

**YES, the flow works exactly like ZP Amaravati!** Here's the flow:

1. **User sends trigger words** → "hi", "hello", "start", etc.
2. **System finds the flow** → Matches trigger to your custom flow
3. **Language selection appears** → Shows language buttons (English, Hindi, Odia)
4. **User clicks language button** → Flow progresses to next step (e.g., main menu)
5. **Flow continues** → Based on your configured steps and expected responses

---

## 🚀 Step-by-Step Setup from Dashboard

### **STEP 1: Navigate to Flow Builder**

1. **Login as SuperAdmin**
   - Go to `http://localhost:3000` (or your frontend URL)
   - Login with SuperAdmin credentials

2. **Go to Jharsuguda Company Page**
   - Click on **SuperAdmin Dashboard**
   - Find **"Jharsuguda Odisha"** company (or search for it)
   - Click on the company card to open details page

3. **Open Flow Customization**
   - Look at the **top-right corner** of the company page
   - Click the **🟣 "Customize Chatbot"** button (purple button)

4. **Create New Flow**
   - Click **"+ Create New Flow"** button
   - You'll see the flow builder interface

---

## 📝 STEP 2: Configure Flow Triggers

**This is where you set up "hi", "hello", etc. to start the flow!**

1. **In the Flow Builder**, scroll to **"🎯 Flow Triggers"** section

2. **Add Multiple Triggers:**
   - Click **"Add Trigger"** button
   - For each trigger:
     - **Trigger Type:** Select `📝 Keyword/Message`
     - **Trigger Value:** Enter one of these:
       - `hi`
       - `hello`
       - `start`
       - `namaste`
       - `menu`
     - **Start Step ID:** Leave empty (will use first step)

3. **Quick Add from Presets:**
   - Click the **"Presets..."** dropdown
   - Select from **"Common Messages"** section:
     - `hi`
     - `hello`
     - `start`
     - `menu`

4. **Add at least 3-5 triggers** for better user experience

---

## 🎯 STEP 3: Create Language Selection Step

**This is the first step users see after typing "hi"**

1. **Click "Add Step"** (or use "Add Language Selection" quick button)

2. **Configure Step 1:**
   - **Step ID:** `language_selection`
   - **Step Type:** `🔘 Interactive Buttons`
   - **Message Text (English):**
   ```
   🏛️ Jharsuguda Odisha Government - Official Digital Portal
   
   Namaskar! Welcome to the official WhatsApp service of Jharsuguda Odisha Government.
   We are dedicated to providing transparent and efficient services to all citizens.
   
   👇 Please select your preferred language:
   ```

3. **Add Language Buttons:**
   - Click **"Add Button"** (repeat for each language)
   
   **Button 1:**
   - **Button ID:** `lang_en`
   - **Button Text:** `🇬🇧 English`
   
   **Button 2:**
   - **Button ID:** `lang_hi`
   - **Button Text:** `🇮🇳 हिंदी`
   
   **Button 3:**
   - **Button ID:** `lang_or`
   - **Button Text:** `🇮🇳 ଓଡ଼ିଆ`

4. **Configure Expected Responses:**
   - Scroll to **"🎯 Expected Responses/Triggers"** section
   - Click **"Add Response"** for each language button:
   
   **For English Button:**
   - **Response Type:** `🔘 Button Click`
   - **Expected Value:** `lang_en`
   - **Next Step ID:** `main_menu` (or your next step ID)
   
   **For Hindi Button:**
   - **Response Type:** `🔘 Button Click`
   - **Expected Value:** `lang_hi`
   - **Next Step ID:** `main_menu`
   
   **For Odia Button:**
   - **Response Type:** `🔘 Button Click`
   - **Expected Value:** `lang_or`
   - **Next Step ID:** `main_menu`

5. **Set Default Next Step:**
   - Scroll to bottom
   - **Default Next Step ID:** `main_menu` (fallback if no specific response matches)

---

## 📋 STEP 4: Create Main Menu Step

**This appears after language selection**

1. **Click "Add Step"**

2. **Configure Step 2:**
   - **Step ID:** `main_menu`
   - **Step Type:** `🔘 Interactive Buttons`
   - **Message Text (English):**
   ```
   🏛️ Citizen Services Menu
   
   Welcome to the Jharsuguda Odisha Digital Helpdesk.
   
   👇 Please select a service from the options below:
   ```

3. **Add Service Buttons:**
   - **Button 1:**
     - **Button ID:** `grievance`
     - **Button Text:** `📝 File Grievance`
   
   - **Button 2:**
     - **Button ID:** `appointment`
     - **Button Text:** `📅 Book Appointment`
   
   - **Button 3:**
     - **Button ID:** `track`
     - **Button Text:** `🔍 Track Status`
   
   - **Button 4:**
     - **Button ID:** `rts`
     - **Button Text:** `📋 Right to Service`

4. **Configure Expected Responses:**
   - Add expected responses for each button:
   - `grievance` → Next Step: `grievance_start`
   - `appointment` → Next Step: `appointment_start`
   - `track` → Next Step: `track_status`
   - `rts` → Next Step: `rts_service_selection`

---

## ✅ STEP 5: Save and Activate Flow

1. **Fill in Basic Information:**
   - **Flow Name:** `Jharsuguda Complete Citizen Services Flow`
   - **Description:** `Complete chatbot flow for Jharsuguda with language selection, grievance filing, and appointment booking`
   - **Flow Type:** `custom`

2. **Click "Save Flow"** button (top right)

3. **Activate the Flow:**
   - After saving, go back to the **Chatbot Flows** page
   - Find your newly created flow
   - Click **"Activate"** or **"Assign to Company"**
   - This makes it the active flow for Jharsuguda

---

## 🧪 STEP 6: Test the Flow

1. **Send "hi" to Jharsuguda WhatsApp number**
2. **You should see:**
   - Language selection buttons appear
3. **Click "🇬🇧 English"**
4. **You should see:**
   - Main menu with service options
5. **Click any service button**
6. **Flow should continue** based on your configured steps

---

## 📌 Important Notes

### ✅ **How Triggers Work:**
- When user types **"hi"**, **"hello"**, **"start"**, etc., the system:
  1. Searches for flows with matching triggers
  2. Finds your Jharsuguda flow
  3. Starts from the first step (`language_selection`)
  4. Shows language selection buttons

### ✅ **How Language Buttons Work:**
- When user clicks **"lang_en"**, **"lang_hi"**, or **"lang_or"**:
  1. System checks **Expected Responses** in the language selection step
  2. Finds matching response (e.g., `lang_en` → `button_click`)
  3. Routes to the **Next Step ID** specified (e.g., `main_menu`)
  4. Sets the user's language preference
  5. Executes the next step

### ✅ **Flow Progression:**
- Each step can have:
  - **Expected Responses** → Specific routing for button clicks/text inputs
  - **Default Next Step ID** → Fallback if no specific response matches
  - **Button nextStepId** → Alternative routing (legacy, but still works)

---

## 🎨 Quick Setup Tips

1. **Use Templates:**
   - Click **"Browse Templates"** when creating a new flow
   - Select **"Language Selection Flow"** template
   - It will auto-create the language selection step with all buttons

2. **Copy from ZP Amaravati:**
   - If ZP Amaravati flow exists, you can:
     - View it in the flows list
     - Use it as reference
     - Create a similar one for Jharsuguda

3. **Test Each Step:**
   - Use the **WhatsApp Preview** on the right side
   - It shows how messages will look
   - Test button clicks and flow progression

---

## 🔧 Troubleshooting

### ❌ **Flow not starting when user types "hi":**
- ✅ Check: Flow is **activated** (green status)
- ✅ Check: Flow has **triggers** configured (hi, hello, etc.)
- ✅ Check: Flow is **assigned to Jharsuguda company**

### ❌ **Language buttons not progressing:**
- ✅ Check: **Expected Responses** are configured for each button
- ✅ Check: **Next Step ID** is set correctly in expected responses
- ✅ Check: Next step exists (e.g., `main_menu` step is created)

### ❌ **Wrong company flow triggered:**
- ✅ Check: Flow's **Company ID** matches Jharsuguda
- ✅ Check: WhatsApp config is linked to correct company

---

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check backend logs for flow execution
3. Verify all step IDs match (no typos)
4. Ensure flow is saved and activated

---

**🎉 That's it! Your Jharsuguda chatbot flow is now set up and ready to use!**
