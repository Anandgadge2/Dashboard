# WhatsApp Chatbot Conversation Flow Documentation

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHATBOT CONVERSATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ├─► User sends: "Hi", "Hello", "Hii", "Start", "Namaste", etc.
  │
  ▼
┌─────────────────────────────────┐
│  1. LANGUAGE SELECTION           │
│  Step: language_selection         │
│  ─────────────────────────────   │
│  Options:                         │
│  • English (lang_en)             │
│  • Hindi (lang_hi)                │
│  • Marathi (lang_mr)              │
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│  2. MAIN MENU                    │
│  Step: main_menu                  │
│  ─────────────────────────────   │
│  Available Options:               │
│  • 📝 File Grievance              │
│  • 📅 Book Appointment            │
│  • ⚖️ RTS Services                │
│  • 🔍 Track Status                │
│  • ℹ️ Help & Contact              │
└─────────────────────────────────┘
  │
  ├─────────────────────────────────────────────────────────────┐
  │                                                               │
  ▼                                                               ▼
┌──────────────────────────┐                    ┌──────────────────────────┐
│  GRIEVANCE FLOW          │                    │  APPOINTMENT FLOW         │
│  ─────────────────────   │                    │  ─────────────────────   │
│                          │                    │                          │
│  Step 1: grievance_name │                    │  Step 1: appointment_     │
│  • Ask for Full Name     │                    │    department            │
│                          │                    │  • Show Departments      │
│  Step 2: grievance_      │                    │    (9 + Load More)       │
│    category              │                    │                          │
│  • Show Departments      │                    │  Step 2: appointment_name │
│    (9 + Load More)       │                    │  • Ask for Full Name     │
│  • Can click "Load More  │                    │                          │
│    Departments" to see   │                    │  Step 3: appointment_     │
│    more                  │                    │    purpose               │
│                          │                    │  • Ask for Purpose       │
│  Step 3: grievance_      │                    │                          │
│    description           │                    │  Step 4: appointment_   │
│  • Ask for Description  │                    │    date                   │
│    (min 10 chars)        │                    │  • Show Date Options     │
│                          │                    │                          │
│  Step 4: grievance_photo │                    │  Step 5: appointment_    │
│  • Ask for Photo         │                    │    time                   │
│  • Options:              │                    │  • Show Time Slots       │
│    - Skip Photo          │                    │                          │
│    - Upload Photo        │                    │  Step 6: appointment_    │
│                          │                    │    confirm               │
│  Step 5: grievance_      │                    │  • Show Confirmation     │
│    confirm               │                    │  • Options:              │
│  • Show Summary          │                    │    - Confirm Booking     │
│  • Options:              │                    │    - Cancel              │
│    - Submit Grievance    │                    │                          │
│    - Cancel              │                    │  Step 7: Success         │
│                          │                    │  • Send Reference No     │
│  Step 6: Success         │                    │  • Clear Session         │
│  • Create Grievance      │                    │                          │
│  • Send Reference No      │                    │                          │
│  • Notify Department     │                    │                          │
│  • Clear Session         │                    │                          │
└──────────────────────────┘                    └──────────────────────────┘
  │                                                               │
  │                                                               │
  └─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                    ┌──────────────────────────┐
                    │  TRACK STATUS FLOW        │
                    │  ─────────────────────   │
                    │  Step: track_status       │
                    │  • Ask for Reference No   │
                    │  • Search & Display       │
                    │    Status                 │
                    └──────────────────────────┘
                          │
                          ▼
                    ┌──────────────────────────┐
                    │  RTS SERVICES FLOW       │
                    │  ─────────────────────   │
                    │  Step: rts_service_      │
                    │    selection             │
                    │  • Show RTS Services     │
                    │  • Redirect to Info      │
                    └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SPECIAL COMMANDS                              │
│  • "Back" / "Menu" → Return to Main Menu                         │
│  • "Help" → Show Help Information                               │
│  • "Exit" / "Bye" → End Conversation                            │
│  • "Hi" / "Hello" → Restart from Language Selection             │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Detailed Flow Explanation

### **1. Initial Entry & Language Selection**

**Trigger:** User sends greeting ("Hi", "Hello", "Hii", "Start", "Namaste", "नमस्ते", "restart", "menu")

**Process:**
- System clears any existing session
- Shows language selection with 3 options:
  - English
  - Hindi (हिंदी)
  - Marathi (मराठी)
- User selects language via button or text input
- Language preference is saved in session

**Session State:** `step: 'language_selection'`

---

### **2. Main Menu**

**After Language Selection:**
- System displays main menu with available services
- Menu options depend on company's enabled modules:
  - **📝 File Grievance** (if GRIEVANCE module enabled)
  - **📅 Book Appointment** (if APPOINTMENT module enabled)
  - **⚖️ RTS Services** (if RTS module enabled)
  - **🔍 Track Status** (always available if any service exists)
  - **ℹ️ Help & Contact** (always available)

**Session State:** `step: 'main_menu'`

---

### **3. GRIEVANCE FLOW**

#### **Step 1: Name Collection** (`grievance_name`)
- Bot asks: "Please enter your Full Name"
- User types their name (minimum 2 characters)
- Validation: Name must be at least 2 characters

#### **Step 2: Department Selection** (`grievance_category`)
- Bot fetches all active departments for the company
- **NEW FEATURE:** Shows 9 departments initially
- If more than 9 departments exist, shows "Load More Departments" as 10th option
- User can:
  - Select a department from the list
  - Click "Load More Departments" to see next 9 departments
  - Continue clicking "Load More" until all departments are shown
- Department selection stores: `departmentId`, `departmentName`, `category`
- Priority defaults to "MEDIUM"

#### **Step 3: Description** (`grievance_description`)
- Bot asks: "Please type a detailed description of your issue"
- User provides description (minimum 10 characters)
- Validation: Description must be at least 10 characters

#### **Step 4: Photo Upload** (`grievance_photo`)
- Bot asks: "Upload a photo or document to support your claim (Optional)"
- Options:
  - **⏭️ Skip** - No photo attached
  - **📤 Upload** - User can send image/document
- If upload selected, media is downloaded from WhatsApp and uploaded to Cloudinary

#### **Step 5: Confirmation** (`grievance_confirm`)
- Bot shows summary:
  - Name
  - Department
  - Issue Description
- Options:
  - **✅ Submit Grievance** - Proceed with submission
  - **❌ Cancel** - Cancel and return to main menu

#### **Step 6: Success**
- Grievance is created in database
- Reference number (GRV...) is generated
- Success message sent with:
  - Reference number
  - Department name
  - Date
- Department admin is notified via notification service
- Session is cleared
- Goodbye message sent

---

### **4. APPOINTMENT FLOW**

#### **Step 1: Department Selection** (`appointment_department`)
- Bot shows: "Book an Official Appointment - Select the Department"
- **NEW FEATURE:** Shows 9 departments initially
- If more than 9 departments exist, shows "Load More Departments" as 10th option
- User can:
  - Select a department
  - Click "Load More Departments" to see more
- If ≤3 departments: Shows as buttons
- If >3 departments: Shows as list with pagination

#### **Step 2: Name Collection** (`appointment_name`)
- Bot asks: "Please enter your Full Name"
- User provides name (minimum 2 characters)

#### **Step 3: Purpose** (`appointment_purpose`)
- Bot asks: "Please specify the purpose of your visit"
- User provides purpose (minimum 5 characters)

#### **Step 4: Date Selection** (`appointment_date`)
- Bot shows available dates as buttons
- User selects a date
- Date format: YYYY-MM-DD

#### **Step 5: Time Selection** (`appointment_time`)
- Bot shows time slots:
  - 🕙 10:00 AM - 11:00 AM
  - 🕑 2:00 PM - 3:00 PM
  - 🕓 4:00 PM - 5:00 PM
- User selects preferred time slot

#### **Step 6: Confirmation** (`appointment_confirm`)
- Bot shows complete booking summary:
  - Name
  - Department
  - Date
  - Time
  - Purpose
- Options:
  - **✅ Confirm Booking** - Complete booking
  - **❌ Cancel** - Cancel booking

#### **Step 7: Success**
- Appointment is created in database
- Reference number (APT...) is generated
- Success message sent with all details
- Session is cleared

---

### **5. TRACK STATUS FLOW**

#### **Step: Track Status** (`track_status`)
- Bot asks: "Enter your Reference Number (e.g., GRV... or APT...)"
- User provides reference number
- System searches for:
  - Grievance (if starts with GRV)
  - Appointment (if starts with APT)
- If found: Shows detailed status information
- If not found: Shows error message
- Options to track another or return to main menu

---

### **6. RTS SERVICES FLOW**

#### **Step: RTS Service Selection** (`rts_service_selection`)
- Bot shows RTS services list:
  - 📜 Certificate Services
  - 📋 License Services
  - 📄 Document Services
  - 💰 Pension Services
  - 🎯 Scheme Services
- User selects a service
- Currently shows information message (service under configuration)
- Returns to main menu

---

## 🔄 Special Features

### **Load More Departments Feature**
- **Initial Display:** Shows first 9 departments
- **Load More Button:** Appears as 10th option if more departments exist
- **Pagination:** Each "Load More" click shows next 9 departments
- **Offset Tracking:** Stored in `session.data.deptOffset`
- **Reset:** Offset resets when starting new grievance/appointment flow
- **Works For:**
  - Grievance flow (department selection)
  - Appointment flow (department selection)

### **Session Management**
- **Session States:** Each step is tracked in `session.step`
- **Data Storage:** User inputs stored in `session.data`
- **Language Persistence:** Language preference maintained throughout session
- **Auto-Reset:** Greeting commands ("Hi", "Hello") reset session

### **Error Handling**
- **Invalid Input:** Shows helpful error messages
- **Unrecognized Commands:** Provides guidance on available commands
- **Voice Messages:** Shows message asking user to type instead
- **Session Timeout:** Handles expired sessions gracefully

### **Navigation Commands**
- **"Back" / "Menu"** → Return to main menu
- **"Help"** → Show help information
- **"Exit" / "Bye"** → End conversation and clear session
- **"Hi" / "Hello"** → Restart from language selection

---

## 📱 Message Types Supported

1. **Text Messages** - Primary input method
2. **Button Clicks** - Interactive button responses
3. **List Selections** - WhatsApp list message selections
4. **Media Messages** - Images/documents for grievance photos
5. **Voice Messages** - Detected but prompts user to type instead

---

## 🌐 Multi-Language Support

- **English (en)** - Default
- **Hindi (hi)** - हिंदी
- **Marathi (mr)** - मराठी

All messages, buttons, and options are translated based on user's language selection.

---

## 🔐 Security & Validation

- **Name Validation:** Minimum 2 characters
- **Description Validation:** Minimum 10 characters
- **Purpose Validation:** Minimum 5 characters
- **Department Validation:** Must exist and be active
- **Reference Number Validation:** Must match format (GRV... or APT...)

---

## 📊 Database Operations

- **Grievance Creation:** Creates record with all details
- **Appointment Creation:** Creates record with booking details
- **Status Tracking:** Queries database for existing records
- **Department Fetching:** Retrieves active departments for company
- **Notification Triggering:** Sends notifications to department admins

---

## 🎯 End States

1. **Success Completion:** Grievance/Appointment created, session cleared
2. **Cancellation:** User cancels, returns to main menu
3. **Exit:** User exits, session cleared
4. **Error:** Error message shown, can retry or return to menu
