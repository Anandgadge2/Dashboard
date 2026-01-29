# 🏛️ Complete Guide: Zilla Parishad Amaravati Chatbot Flow

## 📋 Overview

**Company:** Zilla Parishad Amaravati (ZP Amaravati)  
**Company ID:** CMP000001  
**Flow Type:** Complete Citizen Services Bot with Grievance, Appointment & RTS  
**Languages Supported:** English, Hindi, Marathi

---

## 🎯 Step-by-Step Flow Structure

### **PHASE 1: Language Selection (Step 1)**

**Step Configuration:**
- **Step ID:** `language_selection`
- **Step Type:** `Interactive Buttons`
- **Message Text (English):**
```
🇮🇳 Zilla Parishad Amravati - Official Digital Portal

Namaskar! Welcome to the official WhatsApp service of Zilla Parishad Amravati.

We are dedicated to providing transparent and efficient services to all citizens.

👇 Please select your preferred language:
```

**Buttons:**
1. **Button ID:** `lang_en` | **Text:** `🇬🇧 English`
2. **Button ID:** `lang_hi` | **Text:** `🇮🇳 हिंदी`
3. **Button ID:** `lang_mr` | **Text:** `🇮🇳 मराठी`

**Next Step:** `main_menu`

---

### **PHASE 2: Main Menu (Step 2)**

**Step Configuration:**
- **Step ID:** `main_menu`
- **Step Type:** `Interactive Buttons`
- **Message Text (English):**
```
🏛️ Citizen Services Menu

Welcome to the Zilla Parishad Digital Helpdesk.

👇 Please select a service from the options below:
```

**Buttons:**
1. **Button ID:** `grievance` | **Text:** `📝 File Grievance`
2. **Button ID:** `appointment` | **Text:** `📅 Book Appointment`
3. **Button ID:** `rts` | **Text:** `📋 Right to Service`
4. **Button ID:** `track` | **Text:** `🔍 Track Status`
5. **Button ID:** `help` | **Text:** `ℹ️ Help`

**Next Step:** (Routes based on button selection)

---

### **PHASE 3: Grievance Flow**

#### **G1: Start Grievance (Step 3)**

- **Step ID:** `grievance_start`
- **Step Type:** `Message`
- **Message Text:**
```
📝 Register a Grievance

You can file a formal complaint regarding any ZP department.

To begin, please provide the details as requested.
```

**Next Step:** `grievance_name`

---

#### **G2: Citizen Name (Step 4)**

- **Step ID:** `grievance_name`
- **Step Type:** `Collect Input`
- **Message Text:**
```
👤 Citizen Identification

Please enter your Full Name as per official documents:
```

**Input Configuration:**
- **Input Type:** `text`
- **Validation:** Required, Min Length: 2
- **Save To Field:** `citizenName`

**Next Step:** `grievance_category` (Department Selection)

---

#### **G3: Department Selection (Step 5)**

- **Step ID:** `grievance_category`
- **Step Type:** `Interactive List`
- **Message Text:**
```
🏢 Department Selection

Please select the relevant department:
```

**List Configuration:**
- **Button Text:** `Select Department`
- **Sections:** Dynamically generated from company departments
  - Shows up to 9 departments per page
  - "Load More" button if more than 9 departments
  - Each department row ID: `grv_dept_{departmentId}`

**Departments Available:**
- Revenue Department
- Health Department
- Water Supply and Sanitation Department
- Education Department
- Agriculture Department
- Public Works Department
- Social Welfare Department
- Urban Development Department

**Next Step:** `grievance_description`

---

#### **G4: Grievance Description (Step 6)**

- **Step ID:** `grievance_description`
- **Step Type:** `Collect Input`
- **Message Text:**
```
✍️ Grievance Details

Please describe your issue in detail.

Tip: Include date, location, and specific information for faster resolution.
```

**Input Configuration:**
- **Input Type:** `text`
- **Validation:** Required, Min Length: 10
- **Save To Field:** `description`

**Next Step:** `grievance_photo`

---

#### **G5: Supporting Evidence (Step 7)**

- **Step ID:** `grievance_photo`
- **Step Type:** `Interactive Buttons`
- **Message Text:**
```
📎 Supporting Evidence

Upload a photo or document to support your grievance (Optional).
```

**Buttons:**
1. **Button ID:** `photo_skip` | **Text:** `⏭ Skip`
2. **Button ID:** `photo_upload` | **Text:** `📤 Upload Photo`

**Next Step:** `grievance_confirm`

**Note:** If user clicks "Upload Photo", they can send image/document. Media is uploaded to Cloudinary.

---

#### **G6: Verify Grievance (Step 8)**

- **Step ID:** `grievance_confirm`
- **Step Type:** `Interactive Buttons`
- **Message Text:**
```
📋 Confirm Submission

👤 Name: {citizenName}
🏢 Department: {category}
📝 Issue: {description}

Is the above information correct?
```

**Buttons:**
1. **Button ID:** `confirm_yes` | **Text:** `✅ Submit Grievance`
2. **Button ID:** `confirm_no` | **Text:** `❌ Cancel`

**Next Step:** (If confirmed → Creates grievance, shows success message)

---

#### **G7: Grievance Submitted (Step 9)**

- **Step ID:** `grievance_success`
- **Step Type:** `Message`
- **Message Text:**
```
✅ Grievance Registered Successfully

📄 Reference Number: {grievanceId}

Your grievance has been forwarded to the concerned department.

You will be notified on status updates.

Thank you for contacting Zilla Parishad Amravati.
```

**Next Step:** (Flow ends, session cleared)

---

### **PHASE 4: Appointment Flow**

#### **A1: Start Appointment (Step 10)**

- **Step ID:** `appointment_start`
- **Step Type:** `Message`
- **Message Text:**
```
📅 Book an Official Appointment

Schedule a meeting with the Chief Executive Officer (CEO), Zilla Parishad.

Please provide the required details to proceed with your appointment request.
```

**Next Step:** `appointment_name`

---

#### **A2: Citizen Name (Step 11)**

- **Step ID:** `appointment_name`
- **Step Type:** `Collect Input`
- **Message Text:**
```
👤 New Appointment Request

Please enter your Full Name (as per official records):
```

**Input Configuration:**
- **Input Type:** `text`
- **Validation:** Required, Min Length: 2
- **Save To Field:** `citizenName`

**Next Step:** `appointment_purpose`

---

#### **A3: Purpose of Meeting (Step 12)**

- **Step ID:** `appointment_purpose`
- **Step Type:** `Collect Input`
- **Message Text:**
```
🎯 Purpose of Meeting

Please briefly describe the purpose of your meeting with the CEO:
```

**Input Configuration:**
- **Input Type:** `text`
- **Validation:** Required
- **Save To Field:** `purpose`

**Next Step:** `appointment_date`

---

#### **A4: Select Date (Step 13) - DYNAMIC AVAILABILITY**

- **Step ID:** `appointment_date`
- **Step Type:** `🗓️ Dynamic Availability`
- **Message Text:**
```
📅 Select Preferred Date

Please choose a convenient date for your appointment:
```

**Availability Configuration:**
- **Type:** `Date Selection`
- **Date Range:**
  - Start Days: `0` (from today)
  - End Days: `30` (30 days ahead)
- **Save To Field:** `appointmentDate`
- **Department ID:** (Empty - CEO appointments are company-wide)

**Note:** Buttons are **automatically generated** from company admin's availability settings!

**Next Step:** `appointment_time`

---

#### **A5: Select Time Slot (Step 14) - DYNAMIC AVAILABILITY**

- **Step ID:** `appointment_time`
- **Step Type:** `🗓️ Dynamic Availability`
- **Message Text:**
```
⏰ Select Time Slot

Please choose a preferred time:
```

**Availability Configuration:**
- **Type:** `Time Selection`
- **Time Slots:** Based on selected date and availability settings
  - Morning slots (if enabled)
  - Afternoon slots (if enabled)
  - Evening slots (if enabled)
- **Save To Field:** `appointmentTime`

**Note:** Time slots are **dynamically generated** based on:
1. Selected date from previous step
2. Company admin's availability settings for that day
3. Only available time slots are shown

**Next Step:** `appointment_verify`

---

#### **A6: Verify Appointment (Step 15)**

- **Step ID:** `appointment_verify`
- **Step Type:** `Interactive Buttons`
- **Message Text:**
```
📋 Verify Appointment Details

👤 Name: {citizenName}
👔 Meeting With: CEO – Zilla Parishad Amravati
🎯 Purpose: {purpose}
📅 Date: {appointmentDate}
⏰ Time: {appointmentTime}

Is the above information correct?
```

**Buttons:**
1. **Button ID:** `appt_confirm` | **Text:** `✅ Confirm Booking`
2. **Button ID:** `appt_cancel` | **Text:** `❌ Cancel Appointment`

**Next Step:** `appointment_submitted`

---

#### **A7: Appointment Submitted (Step 16)**

- **Step ID:** `appointment_submitted`
- **Step Type:** `Message`
- **Message Text:**
```
✅ Appointment Request Submitted

Your appointment request has been received.

📄 Reference Number: {appointmentId}
📅 Requested Date: {appointmentDate}
⏰ Requested Time: {appointmentTime}

⏳ Status: Pending Approval
You will be notified once the CEO approves or rejects the request.

Thank you for your patience.
```

**Next Step:** (Flow ends, session cleared)

---

### **PHASE 5: Right to Service (RTS) Flow**

#### **R1: RTS Services (Step 17)**

- **Step ID:** `rts_service_selection`
- **Step Type:** `Interactive List` or `Interactive Buttons`
- **Message Text:**
```
📋 Right to Service (RTS)

Please select a service:
```

**Services Available:**
1. **Certificate Services** - Birth, Death, Income, Caste certificates
2. **License Services** - Trade, Driving, Professional licenses
3. **Document Services** - Document verification and attestation
4. **Pension Services** - Old age, widow, disability pensions
5. **Scheme Services** - Government scheme applications

**Next Step:** (Currently redirects to main menu with info message)

---

### **PHASE 6: Status Tracking (Step 18)**

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

**Next Step:** (Backend handles status lookup and displays result)

---

## 🎯 Setting Up the Flow

### **1. Basic Information**

**Flow Name:** `Zilla Parishad Amaravati Complete Citizen Services Flow`

**Description:** 
```
Complete chatbot flow for Zilla Parishad Amaravati with:
- Language selection (English, Hindi, Marathi)
- Main menu with services
- CEO appointment booking with dynamic availability
- Department-based grievance filing
- Right to Service (RTS) services
- Status tracking
```

**Trigger Type:** `Message`

**Trigger Value:** `hi` (or `hello`, `start`, `menu`, `namaste`)

---

### **2. Flow Steps Summary**

| Step | Step ID | Step Type | Purpose |
|------|---------|-----------|---------|
| 1 | `language_selection` | Interactive Buttons | Language selection |
| 2 | `main_menu` | Interactive Buttons | Main services menu |
| 3 | `grievance_start` | Message | Start grievance flow |
| 4 | `grievance_name` | Collect Input | Get citizen name |
| 5 | `grievance_category` | Interactive List | Select department |
| 6 | `grievance_description` | Collect Input | Get grievance details |
| 7 | `grievance_photo` | Interactive Buttons | Upload photo (optional) |
| 8 | `grievance_confirm` | Interactive Buttons | Verify and submit |
| 9 | `grievance_success` | Message | Confirmation message |
| 10 | `appointment_start` | Message | Start appointment flow |
| 11 | `appointment_name` | Collect Input | Get citizen name |
| 12 | `appointment_purpose` | Collect Input | Get meeting purpose |
| 13 | `appointment_date` | Dynamic Availability | Select date |
| 14 | `appointment_time` | Dynamic Availability | Select time slot |
| 15 | `appointment_verify` | Interactive Buttons | Verify appointment |
| 16 | `appointment_submitted` | Message | Confirmation message |
| 17 | `rts_service_selection` | Interactive List | Select RTS service |
| 18 | `track_status` | Collect Input | Track status by ID |

---

### **3. Button Routing Logic**

**Main Menu Buttons:**
- `grievance` → `grievance_start`
- `appointment` → `appointment_start`
- `rts` → `rts_service_selection`
- `track` → `track_status`
- `help` → Shows help message, returns to `main_menu`

**Grievance Flow:**
- `grievance_start` → `grievance_name`
- `grievance_name` → `grievance_category` (auto after input)
- `grievance_category` → `grievance_description` (after department selection)
- `grievance_description` → `grievance_photo` (auto after input)
- `grievance_photo` → `grievance_confirm` (after skip/upload)
- `grievance_confirm` → Creates grievance → `grievance_success`

**Appointment Flow:**
- `appointment_start` → `appointment_name`
- `appointment_name` → `appointment_purpose` (auto after input)
- `appointment_purpose` → `appointment_date` (auto after input)
- `appointment_date` → `appointment_time` (after date selection)
- `appointment_time` → `appointment_verify` (after time selection)
- `appointment_verify` → Creates appointment → `appointment_submitted`

---

### **4. Dynamic Features**

#### **Department Selection:**
- Dynamically loads departments from database
- Shows up to 9 departments per page
- "Load More" button for additional departments
- Uses WhatsApp List format for better UX

#### **Date & Time Selection:**
- Uses Dynamic Availability API
- Respects company admin's availability settings
- Only shows available dates and time slots
- Automatically filters based on weekly schedule and special dates

#### **Media Upload:**
- Supports image and document uploads
- Automatically uploads to Cloudinary
- Optional - user can skip

---

## 📱 Testing Your Flow

### **1. Test Language Selection**
- Send "hi" to WhatsApp number
- Should see language selection buttons
- Select each language and verify messages

### **2. Test Grievance Flow**
- Select "File Grievance"
- Enter name
- Select department from list
- Enter description
- Skip or upload photo
- Confirm submission
- Verify grievance ID received

### **3. Test Appointment Flow**
- Select "Book Appointment"
- Enter name
- Enter purpose
- Select date (should show available dates only)
- Select time (should show available slots only)
- Verify appointment
- Confirm booking
- Verify appointment ID received

### **4. Test RTS Flow**
- Select "Right to Service"
- Choose a service
- Verify response

### **5. Test Status Tracking**
- Select "Track Status"
- Enter a grievance/appointment ID
- Verify status display

---

## ✅ Checklist Before Saving

- [ ] All 18 steps added
- [ ] Step IDs are unique and descriptive
- [ ] Message texts are correct
- [ ] Buttons have proper IDs and text
- [ ] Next step routing is correct
- [ ] Dynamic availability configured for appointment date/time
- [ ] Department list configured for grievance
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
7. **Dynamic Content:** Use placeholders like `{citizenName}`, `{date}`, etc.

---

## 🎉 You're Ready!

Follow this guide step-by-step to create your complete ZP Amaravati flow. The live preview will help you see exactly how it will look on WhatsApp!

**Happy Building! 🚀**

---

**Last Updated:** January 27, 2026  
**Status:** Complete Guide Ready  
**Company:** Zilla Parishad Amaravati (CMP000001)
