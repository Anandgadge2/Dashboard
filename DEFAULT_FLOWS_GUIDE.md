# 📋 Default Flows Guide

## Overview

Default flows are pre-built chatbot flows (Grievance, Appointment, Tracking) that are automatically generated for each company. These flows provide a starting point that you can customize to match your specific requirements.

---

## ✨ Features

- **Automatic Generation**: Generate default flows with one click
- **Fully Customizable**: Edit default flows just like custom flows
- **Visible in Dashboard**: Default flows appear in the chatbot flows list
- **Easy Identification**: Default flows are marked with a "📋 DEFAULT" badge
- **Per-Company**: Each company gets its own set of default flows

---

## 🚀 How to Use

### Step 1: Generate Default Flows

1. **Navigate to Chatbot Flows Page:**
   - Go to: **SuperAdmin Dashboard** → **Company** → **[Your Company]**
   - Click **"Customize Chatbot"** button

2. **Generate Default Flows:**
   - If default flows don't exist, you'll see a blue card: **"Default Flows Available"**
   - Click **"Generate Default Flows"** button
   - Wait for success message
   - Default flows will appear in the list

### Step 2: View Default Flows

After generation, you'll see three default flows:

1. **Default Grievance Flow** (`flowType: 'grievance'`)
   - Standard grievance filing flow
   - Includes: Name collection, Department selection, Description, Photo upload, Confirmation

2. **Default Appointment Flow** (`flowType: 'appointment'`)
   - Standard appointment booking flow
   - Includes: Name, Purpose, Date selection, Time selection, Verification

3. **Default Tracking Flow** (`flowType: 'tracking'`)
   - Standard status tracking flow
   - Includes: Reference number collection, Status display

### Step 3: Customize Default Flows

Default flows are **fully editable**:

1. **Click "Edit"** button on any default flow
2. **Modify steps, messages, buttons, etc.**
3. **Save changes**
4. **Assign to WhatsApp** when ready

**Note:** Default flows work exactly like custom flows - you can:
- ✅ Edit all steps
- ✅ Change messages
- ✅ Add/remove buttons
- ✅ Modify triggers
- ✅ Configure expected responses
- ✅ Assign to WhatsApp
- ✅ Activate/deactivate
- ✅ Duplicate
- ✅ Delete (permanent)

---

## 🎨 Visual Indicators

### Default Flow Badge
- **Orange "📋 DEFAULT" badge** on default flows
- **Orange border** on the left side of the card
- **Orange flow type badge** (instead of blue)

### Custom Flow Badge
- **Blue flow type badge** on custom flows
- **No special border** (unless active)

### Active Flow Badge
- **Green "✓ ACTIVE" badge** on active flows
- **Green border** around the card

---

## 📝 Default Flow Structure

### Default Grievance Flow

**Triggers:**
- Button click: `grievance`

**Steps:**
1. `grievance_start` - Welcome message
2. `grievance_name` - Collect name (input)
3. `grievance_category` - Department selection
4. `grievance_description` - Collect description (input)
5. `grievance_photo` - Photo request
6. `grievance_confirm` - Confirmation (buttons)
7. `grievance_success` - Success message
8. `grievance_cancelled` - Cancelled message

### Default Appointment Flow

**Triggers:**
- Button click: `appointment`

**Steps:**
1. `appointment_start` - Welcome message
2. `appointment_name` - Collect name (input)
3. `appointment_purpose` - Collect purpose (input)
4. `appointment_date` - Date selection (API call)
5. `appointment_time` - Time selection
6. `appointment_verify` - Verification (buttons)
7. `appointment_submitted` - Success message
8. `appointment_cancelled` - Cancelled message

### Default Tracking Flow

**Triggers:**
- Button click: `track`

**Steps:**
1. `track_start` - Collect reference number (input)
2. `track_result` - Show status

---

## 🔧 API Endpoints

### Generate Default Flows
```
POST /api/chatbot-flows/company/:companyId/generate-defaults
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 3 default flow(s) successfully",
  "data": [...flows]
}
```

### Check if Default Flows Exist
```
GET /api/chatbot-flows/company/:companyId/has-defaults
```

**Response:**
```json
{
  "success": true,
  "hasDefaults": true
}
```

---

## ⚠️ Important Notes

1. **One-Time Generation:**
   - Default flows can only be generated once per company
   - If they already exist, you'll see an error message
   - You can still edit existing default flows

2. **Not Active by Default:**
   - Default flows are created with `isActive: false`
   - You must activate them or assign to WhatsApp to use them

3. **Module-Based:**
   - Grievance flow is only generated if `GRIEVANCE` module is enabled
   - Appointment flow is only generated if `APPOINTMENT` module is enabled
   - Tracking flow is always generated

4. **Fully Customizable:**
   - Default flows are just starting points
   - You can modify them completely
   - They become regular flows after customization

5. **Permanent Deletion:**
   - Deleting a default flow permanently removes it
   - You cannot regenerate it (would need to delete all default flows first)
   - Consider duplicating before major changes

---

## 🎯 Best Practices

1. **Generate First, Customize Later:**
   - Generate default flows first
   - Review the structure
   - Then customize to match your needs

2. **Duplicate Before Major Changes:**
   - If you want to keep the original, duplicate it first
   - Then customize the duplicate

3. **Test After Customization:**
   - Always test default flows after customization
   - Assign to WhatsApp and test with real messages

4. **Use as Templates:**
   - Default flows can serve as templates
   - Duplicate and modify for different use cases

---

## 🐛 Troubleshooting

### Issue: "Default flows already exist"
**Solution:** Default flows are already generated. Edit them from the flows list.

### Issue: Default flows not showing
**Check:**
1. ✅ Are default flows generated? (Check "has-defaults" endpoint)
2. ✅ Are they deleted? (Check `isDeleted: false`)
3. ✅ Refresh the page

### Issue: Can't edit default flow
**Solution:** Default flows are editable like custom flows. If you can't edit, check:
- User has SUPER_ADMIN role
- Flow exists in database
- Backend server is running

---

## 📊 Flow Comparison

| Feature | Default Flows | Custom Flows |
|---------|--------------|--------------|
| Generation | One-click generation | Manual creation |
| Badge | "📋 DEFAULT" (orange) | Flow type (blue) |
| Border | Orange left border | No special border |
| Editable | ✅ Yes | ✅ Yes |
| Deletable | ✅ Yes (permanent) | ✅ Yes (permanent) |
| Assignable | ✅ Yes | ✅ Yes |
| Customizable | ✅ Fully | ✅ Fully |

---

## 🎉 Summary

Default flows provide a quick way to get started with chatbot flows. They are:
- ✅ Easy to generate
- ✅ Fully customizable
- ✅ Visible in dashboard
- ✅ Ready to use after customization

**Generate default flows → Customize → Assign to WhatsApp → Test!**
