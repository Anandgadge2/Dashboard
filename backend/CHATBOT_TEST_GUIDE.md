# Comprehensive Chatbot Testing Guide

## Overview

This guide covers all possible citizen and chatbot interactions in the system.

## Test Script

Run the comprehensive test:
```bash
cd backend
npm run build
npm run test:chatbot
```

## Test Coverage

### 1. Language Selection Flow
- ✅ Initial "Hi" message triggers language selection
- ✅ English selection (button)
- ✅ Hindi selection (button)
- ✅ Marathi selection (button)
- ✅ Invalid language handling

### 2. Main Menu Navigation
- ✅ Main menu displays all options
- ✅ Help menu
- ✅ Back command
- ✅ Menu command
- ✅ Invalid option handling

### 3. Grievance Flow (Complete)
- ✅ Start grievance flow
- ✅ Enter citizen name
- ✅ Select department/category
- ✅ Enter description
- ✅ Location handling (skip/manual)
- ✅ Photo handling (skip/upload)
- ✅ Priority selection
- ✅ Confirm and submit
- ✅ Database verification

### 4. Grievance Flow (With Location)
- ✅ Manual location entry
- ✅ Grievance with location submitted

### 5. Appointment Flow (Complete)
- ✅ Start appointment flow
- ✅ Select department
- ✅ Enter name
- ✅ Enter purpose
- ✅ Select date
- ✅ Select time slot
- ✅ Confirm booking
- ✅ Database verification

### 6. Status Tracking
- ✅ Track status with valid grievance ID
- ✅ Track status with invalid ID
- ✅ Track status with appointment ID
- ✅ Error handling for not found

### 7. Error Handling & Edge Cases
- ✅ Invalid menu option
- ✅ Name validation (too short)
- ✅ Description validation (too short)
- ✅ Cancel grievance flow
- ✅ Invalid input handling

### 8. Multi-Language Content
- ✅ Hindi language support
- ✅ Marathi language support
- ✅ Language-specific translations

### 9. Navigation & Flow Control
- ✅ Back to menu button
- ✅ Help command during flow
- ✅ Session management

## Manual Testing Scenarios

### Scenario 1: Complete Grievance Registration (English)
1. Send: `Hi`
2. Click: `English` button
3. Click: `File Grievance` button
4. Type: `John Doe`
5. Click: Department from list
6. Type: `Water supply issue in my area. No water for 3 days.`
7. Click: `Skip` for location
8. Click: `Skip` for photo
9. Click: `High` priority
10. Click: `Submit Grievance`
11. ✅ Should receive confirmation with Reference ID

### Scenario 2: Complete Appointment Booking (Hindi)
1. Send: `Hi`
2. Click: `हिंदी` button
3. Click: `Book Appointment` button
4. Click: Department from list
5. Type: `राम कुमार`
6. Type: `दस्तावेज़ चर्चा करना है`
7. Click: Date from calendar
8. Click: Time slot
9. Click: `Confirm Booking`
10. ✅ Should receive confirmation with Appointment ID

### Scenario 3: Status Tracking
1. Send: `Hi`
2. Click: `English` button
3. Click: `Track Status` button
4. Type: `GRV00000001` (your grievance ID)
5. ✅ Should see status details

### Scenario 4: Error Handling
1. Send: `Hi`
2. Click: `English` button
3. Click: `File Grievance` button
4. Type: `A` (too short)
5. ✅ Should see validation error
6. Type: `John Doe` (valid)
7. Click: Department
8. Type: `Short` (too short)
9. ✅ Should see validation error

### Scenario 5: Navigation
1. Start grievance flow
2. Click: `Back to Main Menu` button
3. ✅ Should return to main menu
4. Type: `help`
5. ✅ Should see help information

## Expected Behaviors

### ✅ Success Indicators
- All messages sent successfully
- Database records created
- Reference IDs generated
- Notifications sent
- Proper language translations
- Smooth flow navigation

### ⚠️ Error Handling
- Invalid inputs show error messages
- Validation errors are clear
- Session persists correctly
- Can recover from errors
- Can cancel flows

## Testing Checklist

- [ ] Language selection works (EN/HI/MR)
- [ ] Main menu displays correctly
- [ ] Grievance flow completes end-to-end
- [ ] Appointment flow completes end-to-end
- [ ] Status tracking works
- [ ] Help menu displays
- [ ] Back navigation works
- [ ] Error handling works
- [ ] Validation works
- [ ] Database saves correctly
- [ ] Notifications sent
- [ ] Multi-language support
- [ ] Session management
- [ ] Button interactions
- [ ] Text input handling

## Common Issues & Solutions

### Issue: Messages not received
- **Check:** WhatsApp credentials in `.env`
- **Check:** Phone number is verified in Meta Business Manager
- **Check:** Backend server is running

### Issue: Flow breaks
- **Check:** Database connection
- **Check:** Company configuration
- **Check:** Department exists
- **Check:** Session not expired

### Issue: Validation errors
- **Check:** Input length requirements
- **Check:** Required fields
- **Check:** Format requirements

## Performance Testing

### Load Testing
- Test with multiple concurrent users
- Test session management
- Test database performance

### Stress Testing
- Test with invalid inputs
- Test with missing data
- Test with network issues

## Security Testing

- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Session security
- ✅ Authentication

## Notes

- Use verified WhatsApp numbers for testing
- Check Ethereal Email for notification emails
- Monitor backend logs for errors
- Verify database records after each test
- Test in all three languages (EN/HI/MR)
