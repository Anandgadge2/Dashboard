# 🏛️ Complete Guide: Creating Jharsuguda Chatbot Flow

## 📋 Overview

**Company:** Jharsuguda Odisha Gov  
**Company ID:** CMP000003  
**Flow Type:** Complete Citizen Services Bot with Appointment & Grievance

---

## 🎯 Step-by-Step Creation Process

### **STEP 1: Navigate to Flow Builder**

1. **Login as SuperAdmin**
   - Go to `http://localhost:3000`
   - Login with SuperAdmin credentials

2. **Go to Company Page**
   - Click on SuperAdmin Dashboard
   - Find "Jharsuguda" company (CMP000003)
   - Click on it to open company details page

3. **Open Flow Customization**
   - Look at the **top-right corner** of the page
   - Click the **🟣 "Customize Chatbot"** button (purple)

4. **Create New Flow**
   - Click **"+ Create New Flow"** button
   - You'll see the flow builder with live preview on the right

---

## 🏗️ Building the Flow Structure

### **PHASE 1: Language Selection (Step 1)**

**Step Configuration:**
- **Step ID:** `language_selection`
- **Step Type:** `Interactive Buttons`
- **Message Text (English):**
```
🏛️ Jharsuguda Odisha Gov – Official Digital Portal

Hello!
Welcome to the official WhatsApp service of
Jharsuguda Odisha Gov.
We are committed to providing transparent,
efficient, and citizen-friendly services.

👇 Please select your preferred language:
```

**Buttons:**
1. **Button ID:** `lang_en` | **Text:** `🇬🇧 English`
2. **Button ID:** `lang_hi` | **Text:** `🇮🇳 हिंदी`
3. **Button ID:** `lang_or` | **Text:** `🇮🇳 ଓଡ଼ିଆ`

**Next Step:** `main_menu`

---

### **PHASE 2: Main Menu (Step 2)**

**Step Configuration:**
- **Step ID:** `main_menu`
- **Step Type:** `Interactive Buttons`
- **Message Text (English):**
```
🏛️ Citizen Services Menu

Welcome to the Jharsuguda Odisha Digital Helpdesk.

👇 Please select a service:
```

**Buttons:**
1. **Button ID:** `service_grievance` | **Text:** `📝 File Grievance`
2. **Button ID:** `service_appointment` | **Text:** `📅 Book Appointment`
3. **Button ID:** `service_track` | **Text:** `🔍 Track Status`
4. **Button ID:** `service_exit` | **Text:** `❌ Exit`

**Next Step:** (Leave empty - buttons will route to different flows)

---

### **PHASE 3: Appointment Flow**

#### **A1: Start Appointment (Step 3)**

- **Step ID:** `appointment_start`
- **Step Type:** `Interactive Buttons`
- **Message Text:**
```
📅 Book an Official Appointment

You can request a meeting with the
Chief Executive Officer (CEO),
Jharsuguda Odisha.

Please provide the required details to proceed.
```

**Buttons:**
1. **Button ID:** `appt_continue` | **Text:** `▶ Start Appointment`
2. **Button ID:** `appt_back_menu` | **Text:** `⬅ Back to Main Menu`
3. **Button ID:** `appt_exit` | **Text:** `❌ Cancel Appointment`

**Next Step:** `appointment_name`

---

#### **A2: Citizen Name (Step 4)**

- **Step ID:** `appointment_name`
- **Step Type:** `Collect Input`
- **Message Text:**
```
👤 New Appointment Request

Please enter your Full Name
(as per official records):
```

**Input Configuration:**
- **Input Type:** `text`
- **Validation:** Required, Min Length: 3
- **Save To Field:** `citizenName`

**Buttons:**
1. **Button ID:** `appt_back` | **Text:** `⬅ Back`
2. **Button ID:** `appt_cancel` | **Text:** `❌ Cancel Appointment`

**Next Step:** `appointment_purpose`

---

#### **A3: Purpose of Meeting (Step 5)**

- **Step ID:** `appointment_purpose`
- **Step Type:** `Collect Input`
- **Message Text:**
```
🎯 Purpose of Meeting

Please briefly describe the purpose
of your meeting with the CEO.
```

**Input Configuration:**
- **Input Type:** `text`
- **Validation:** Required, Min Length: 10
- **Save To Field:** `purpose`

**Next Step:** `appointment_date`

---

#### **A4: Select Date (Step 6) - DYNAMIC AVAILABILITY**

- **Step ID:** `appointment_date`
- **Step Type:** `🗓️ Dynamic Availability` ⭐ **NEW!**
- **Message Text:**
```
📅 Select Preferred Date

Please choose a convenient date:
```

**Availability Configuration:**
- **Type:** `Date Selection`
- **Date Range:**
  - Start Days: `0` (from today)
  - End Days: `30` (30 days ahead)
- **Save To Field:** `appointmentDate`
- **Department ID:** (Leave empty for company-wide)

**Note:** Buttons will be **automatically generated** from company admin's availability settings! No need to manually add date buttons.

**Optional Action Buttons:**
- Button 1: `appt_back` | `⬅ Back`
- Button 2: `appt_cancel` | `❌ Cancel Appointment`

**Next Step:** `appointment_time`

---

#### **A5: Select Time Slot (Step 7) - DYNAMIC AVAILABILITY**

- **Step ID:** `appointment_time`
- **Step Type:** `🗓️ Dynamic Availability` ⭐ **NEW!**
- **Message Text:**
```
⏰ Select Time Slot

Please choose a preferred time:
```

**Availability Configuration:**
- **Type:** `Time Selection`
- **Time Slots:**
  - Show Morning: ✅ (9 AM - 12 PM)
  - Show Afternoon: ✅ (2 PM - 5 PM)
  - Show Evening: ✅ (5 PM - 7 PM)
- **Save To Field:** `appointmentTime`
- **Department ID:** (Leave empty)

**Note:** Time slots will be **automatically generated** based on:
1. Selected date from previous step
2. Company admin's availability settings for that day
3. Only available time slots will be shown!

**Optional Action Buttons:**
- Button 1: `appt_back` | `⬅ Back`
- Button 2: `appt_cancel` | `❌ Cancel Appointment`

**Next Step:** `appointment_verify`

---

#### **A6: Verify Appointment (Step 8)**

- **Step ID:** `appointment_verify`
- **Step Type:** `Interactive Buttons`
- **Message Text:**
```
📋 Verify Appointment Details

👤 Name: <Citizen Name>
👔 Meeting With: CEO – Jharsuguda Odisha
🎯 Purpose: <Purpose>
📅 Date: <Date>
⏰ Time: <Time>

Is the above information correct?
```

**Buttons:**
1. **Button ID:** `appt_confirm` | **Text:** `✅ Confirm Booking`
2. **Button ID:** `appt_edit` | **Text:** `⬅ Edit Details`
3. **Button ID:** `appt_cancel` | **Text:** `❌ Cancel Appointment`

**Next Step:** `appointment_submitted`

---

#### **A7: Appointment Submitted (Step 9)**

- **Step ID:** `appointment_submitted`
- **Step Type:** `Interactive Buttons`
- **Message Text:**
```
✅ Appointment Request Submitted

Your appointment request has been received.

📄 Reference Number: APT00000006
📅 Requested Date: Friday, 30 January 2026
⏰ Requested Time: 9:00 AM

⏳ Status: Pending Approval
You will be notified once the CEO
approves or rejects the request.

Thank you for your patience.
```

**Buttons:**
1. **Button ID:** `service_track` | **Text:** `🔍 Track Status`
2. **Button ID:** `main_menu` | **Text:** `🏠 Main Menu`
3. **Button ID:** `service_exit` | **Text:** `❌ Exit`

**Next Step:** (Leave empty - flow ends here)

---

### **PHASE 4: Grievance Flow**

#### **G1: Start Grievance (Step 10)**

- **Step ID:** `grievance_start`
- **Step Type:** `Interactive Buttons`
- **Message Text:**
```
📝 Register a Grievance

You can file a formal grievance
regarding any Jharsuguda Odisha Department.

Please provide the required details.
```

**Buttons:**
1. **Button ID:** `griev_continue` | **Text:** `▶ Continue`
2. **Button ID:** `griev_back_menu` | **Text:** `⬅ Back to Menu`
3. **Button ID:** `griev_exit` | **Text:** `❌ Exit`

**Next Step:** `grievance_name`

---

#### **G2: Citizen Name (Step 11)**

- **Step ID:** `grievance_name`
- **Step Type:** `Collect Input`
- **Message Text:**
```
👤 Citizen Identification

Please enter your Full Name
as per official documents:
```

**Input Configuration:**
- **Input Type:** `text`
- **Validation:** Required, Min Length: 3
- **Save To Field:** `citizenName`

**Next Step:** `grievance_department`

---

#### **G3: Department Selection (Step 12)**

- **Step ID:** `grievance_department`
- **Step Type:** `Interactive List`
- **Message Text:**
```
🏢 Department Selection

Please select the relevant department:
```

**List Configuration:**
- **Button Text:** `Select Department`
- **Sections:**
  - **Section 1:**
    - Agriculture
    - Education
    - Health
  - **Section 2:**
    - Works
    - Water Supply
    - Social Welfare

**Next Step:** `grievance_details`

---

#### **G4: Grievance Details (Step 13)**

- **Step ID:** `grievance_details`
- **Step Type:** `Collect Input`
- **Message Text:**
```
✍️ Grievance Details

Please describe your issue in detail.

Tip:
Include date, location, and
specific information for faster resolution.
```

**Input Configuration:**
- **Input Type:** `text`
- **Validation:** Required, Min Length: 20
- **Save To Field:** `description`

**Next Step:** `grievance_media`

---

#### **G5: Supporting Evidence (Step 14)**

- **Step ID:** `grievance_media`
- **Step Type:** `Media`
- **Message Text:**
```
📎 Supporting Evidence

Upload a photo or document
to support your grievance (Optional).
```

**Buttons:**
1. **Button ID:** `griev_upload` | **Text:** `📤 Upload`
2. **Button ID:** `griev_skip` | **Text:** `⏭ Skip`

**Next Step:** `grievance_verify`

---

#### **G6: Verify Grievance (Step 15)**

- **Step ID:** `grievance_verify`
- **Step Type:** `Interactive Buttons`
- **Message Text:**
```
📋 Confirm Submission

👤 Name: <Name>
🏢 Department: <Department>
📝 Issue: <Summary>

Is the above information correct?
```

**Buttons:**
1. **Button ID:** `griev_confirm` | **Text:** `✅ Submit Grievance`
2. **Button ID:** `griev_edit` | **Text:** `⬅ Edit`
3. **Button ID:** `griev_cancel` | **Text:** `❌ Cancel`

**Next Step:** `grievance_submitted`

---

#### **G7: Grievance Submitted (Step 16)**

- **Step ID:** `grievance_submitted`
- **Step Type:** `Interactive Buttons`
- **Message Text:**
```
✅ Grievance Registered Successfully

📄 Reference Number: GRV00001234

Your grievance has been forwarded
to the concerned department.

You will be notified on status updates.
```

**Buttons:**
1. **Button ID:** `service_track` | **Text:** `🔍 Track Status`
2. **Button ID:** `main_menu` | **Text:** `🏠 Main Menu`
3. **Button ID:** `service_exit` | **Text:** `❌ Exit`

**Next Step:** (Leave empty)

---

### **PHASE 5: Status Tracking (Step 17)**

- **Step ID:** `track_status`
- **Step Type:** `Collect Input`
- **Message Text:**
```
🔍 Track Status

Please enter your Reference Number:
```

**Input Configuration:**
- **Input Type:** `text`
- **Validation:** Required
- **Save To Field:** `referenceNumber`

**Next Step:** (Will be handled by backend to show status)

---

## 🎯 Setting Up the Flow

### **1. Basic Information**

In the flow builder:

**Flow Name:** `Jharsuguda Complete Citizen Services Flow`

**Description:** 
```
Complete chatbot flow for Jharsuguda Odisha Gov with:
- Language selection (English, Hindi, Odia)
- Main menu with services
- CEO appointment booking
- Department-based grievance filing
- Status tracking
```

**Trigger Type:** `Message`

**Trigger Value:** `hi` (or `hello`, `start`, `menu`)

---

### **2. Adding Steps**

1. Click **"Add Step"** button
2. Fill in step details (as per phases above)
3. **Watch the live preview** on the right update
4. Continue adding all 17 steps

---

### **3. Button Routing Logic**

**Important:** The flow builder currently uses `nextStep` field. For button-specific routing, you'll need to:

1. **Set Next Step** for each step
2. **For buttons that go back:** Use step IDs like `main_menu`, `appointment_start`
3. **For buttons that exit:** Leave next step empty or create an exit step

---

### **4. Saving the Flow**

1. Review all steps in the preview
2. Click **"Save Flow"** button (top right)
3. Flow will be saved and you'll be redirected to flows list

---

### **5. Activating the Flow**

1. Go back to Chatbot Flows page
2. Find your "Jharsuguda Complete Citizen Services Flow"
3. Click the **▶ Activate** button
4. Flow is now live!

---

## ✏️ How to Edit Existing ZP Amaravati Flow

### **Method 1: Edit from Flows List**

1. **Navigate to Company**
   - Go to SuperAdmin Dashboard
   - Click on "ZP Amaravati" company

2. **Open Chatbot Flows**
   - Click **🟣 "Customize Chatbot"** button

3. **Find the Flow**
   - Look for "ZP Amaravati" flow in the list
   - You'll see it with version number

4. **Edit Flow**
   - Click **✏️ Edit** button (pencil icon)
   - Flow builder opens with existing steps

5. **Make Changes**
   - Click on any step card to select it
   - Edit message text, buttons, etc.
   - **Preview updates live** on the right

6. **Add New Steps**
   - Click **"Add Step"** button
   - New step appears at the end
   - Use **Move Up/Down** buttons to reorder

7. **Delete Steps**
   - Click **🗑️ Delete** button on step card
   - Step is removed

8. **Save Changes**
   - Click **"Save Flow"** button
   - Changes are saved

---

### **Method 2: Duplicate and Modify**

1. **Duplicate Flow**
   - Click **📋 Copy** button on ZP Amaravati flow
   - New flow created with same structure

2. **Edit Duplicate**
   - Click **✏️ Edit** on the new flow
   - Modify as needed
   - Save with new name

3. **Activate New Flow**
   - Deactivate old flow
   - Activate new flow

---

## 🔧 Advanced Configuration

### **Setting Up Button Routing**

Currently, the flow builder uses a linear `nextStep` approach. For complex routing:

1. **Use Step IDs** for navigation:
   - `main_menu` → Always goes to main menu
   - `appointment_start` → Starts appointment flow
   - `grievance_start` → Starts grievance flow

2. **Back Buttons:**
   - Set `nextStep` to previous step ID
   - Example: In `appointment_name`, back button → `appointment_start`

3. **Menu Buttons:**
   - Set `nextStep` to `main_menu`
   - This resets to main menu

---

### **Language Support**

To add Hindi and Odia translations:

1. **For each step**, you can add:
   - Message text in English (currently supported)
   - Message text in Hindi (can be added to content.text.hi)
   - Message text in Odia (can be added to content.text.mr or new field)

**Note:** The current UI shows English only. Backend can support multiple languages if you add them to the step content.

---

### **Dynamic Content (Variables)**

For showing dynamic values like `<Citizen Name>`, `<Date>`, etc.:

**Current Limitation:** The flow builder shows static text. Dynamic variables will be handled by the backend flow execution engine.

**To Use Variables:**
- In message text, use placeholders like: `{citizenName}`, `{date}`, `{purpose}`
- Backend will replace these with actual values during execution

---

## 📱 Testing Your Flow

### **1. Test in Preview**

- As you build, **watch the right-side preview**
- Click different steps to see them highlighted
- Verify button layout and text

### **2. Test After Activation**

1. **Send WhatsApp Message:**
   - Send "hi" to the company's WhatsApp number
   - Bot should respond with language selection

2. **Test Each Path:**
   - Test appointment flow end-to-end
   - Test grievance flow end-to-end
   - Test status tracking
   - Test back buttons
   - Test exit buttons

3. **Test Reset:**
   - After completing a flow, send "hi" again
   - Should reset to language selection

---

## 🎯 Quick Reference: Step IDs

| Step | Step ID | Purpose |
|------|---------|---------|
| 1 | `language_selection` | Language selection |
| 2 | `main_menu` | Main services menu |
| 3 | `appointment_start` | Start appointment |
| 4 | `appointment_name` | Get citizen name |
| 5 | `appointment_purpose` | Get purpose |
| 6 | `appointment_date` | Select date |
| 7 | `appointment_time` | Select time |
| 8 | `appointment_verify` | Verify details |
| 9 | `appointment_submitted` | Confirmation |
| 10 | `grievance_start` | Start grievance |
| 11 | `grievance_name` | Get name |
| 12 | `grievance_department` | Select department |
| 13 | `grievance_details` | Get details |
| 14 | `grievance_media` | Upload media |
| 15 | `grievance_verify` | Verify grievance |
| 16 | `grievance_submitted` | Confirmation |
| 17 | `track_status` | Track status |

---

## ✅ Checklist Before Saving

- [ ] All 17 steps added
- [ ] Step IDs are unique and descriptive
- [ ] Message texts are correct
- [ ] Buttons have proper IDs and text
- [ ] Next step routing is correct
- [ ] Back buttons route to previous steps
- [ ] Menu buttons route to `main_menu`
- [ ] Exit buttons end the flow
- [ ] Preview looks good
- [ ] Flow name and description filled
- [ ] Trigger value set to "hi"

---

## 🚀 Next Steps After Creation

1. **Save the Flow**
2. **Activate it** (only one active per company)
3. **Test with WhatsApp**
4. **Monitor usage**
5. **Iterate based on feedback**

---

## 💡 Pro Tips

1. **Use Descriptive Step IDs:** Makes routing easier
2. **Test in Preview:** See exactly how it looks
3. **Keep Messages Clear:** Government users need clarity
4. **Add Help Text:** Guide users at each step
5. **Handle Errors:** Plan for invalid inputs
6. **Test Reset Logic:** Ensure "hi" always resets flow

---

## 🎉 You're Ready!

Follow this guide step-by-step to create your complete Jharsuguda flow. The live preview will help you see exactly how it will look on WhatsApp!

**Happy Building! 🚀**

---

**Last Updated:** January 27, 2026  
**Status:** Complete Guide Ready
