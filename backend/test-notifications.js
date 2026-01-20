/**
 * Test Notification System
 * Run: node test-notifications.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('./dist/config/database');
const { notifyDepartmentAdminOnCreation, notifyUserOnAssignment, notifyCitizenOnResolution, notifyHierarchyOnStatusChange } = require('./dist/services/notificationService');

async function testNotifications() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connected\n');

    // Fetch actual IDs from database
    const mongoose = require('mongoose');
    const Company = require('./dist/models/Company').default;
    const Department = require('./dist/models/Department').default;
    const User = require('./dist/models/User').default;

    console.log('📋 Fetching test data from database...');
    
    // Get first company
    const company = await Company.findOne({ isDeleted: false });
    if (!company) {
      console.error('❌ No company found in database! Please create a company first.');
      process.exit(1);
    }
    console.log(`✅ Found company: ${company.name} (${company.companyId})`);

    // Get first department
    const department = await Department.findOne({ 
      companyId: company._id,
      isDeleted: false 
    });
    if (!department) {
      console.error('❌ No department found in database! Please create a department first.');
      process.exit(1);
    }
    console.log(`✅ Found department: ${department.name} (${department.departmentId})`);

    // Get department admin
    const departmentAdmin = await User.findOne({
      role: 'DEPARTMENT_ADMIN',
      departmentId: department._id,
      isActive: true,
      isDeleted: false
    });
    if (!departmentAdmin) {
      console.warn('⚠️  No department admin found. Will use first available user.');
    } else {
      console.log(`✅ Found department admin: ${departmentAdmin.getFullName()}`);
    }

    // Get operator/user for assignment
    const operator = await User.findOne({
      role: 'OPERATOR',
      departmentId: department._id,
      isActive: true,
      isDeleted: false
    });
    if (!operator) {
      console.warn('⚠️  No operator found. Will use first available user.');
    } else {
      console.log(`✅ Found operator: ${operator.getFullName()}`);
    }

    // Use operator or department admin or first user
    const testUser = operator || departmentAdmin || await User.findOne({ isActive: true, isDeleted: false });
    if (!testUser) {
      console.error('❌ No users found in database! Please create users first.');
      process.exit(1);
    }
    console.log(`✅ Using user for assignment: ${testUser.getFullName()}\n`);

    // Test 1: Department Admin Notification on Creation
    console.log('📧 Test 1: Department Admin Notification on Creation');
    console.log('='.repeat(60));
    
    await notifyDepartmentAdminOnCreation({
      type: 'grievance',
      action: 'created',
      grievanceId: 'GRV00000001',
      citizenName: 'Test Citizen',
      citizenPhone: '919356150561',
      citizenWhatsApp: '919356150561',
      departmentId: department._id.toString(),
      companyId: company._id.toString(),
      description: 'Test grievance description for testing notifications',
      category: 'Water Supply',
      priority: 'HIGH',
      location: 'Test Location'
    });

    console.log('\n✅ Test 1 completed\n');

    // Test 2: User Assignment Notification
    console.log('📧 Test 2: User Assignment Notification');
    console.log('='.repeat(60));
    
    await notifyUserOnAssignment({
      type: 'grievance',
      action: 'assigned',
      grievanceId: 'GRV00000001',
      citizenName: 'Test Citizen',
      citizenPhone: '919356150561',
      departmentId: department._id.toString(),
      companyId: company._id.toString(),
      description: 'Test grievance',
      assignedTo: testUser._id.toString(),
      assignedByName: 'Department Admin'
    });

    console.log('\n✅ Test 2 completed\n');

    // Test 3: Citizen Resolution Notification
    console.log('📧 Test 3: Citizen Resolution Notification');
    console.log('='.repeat(60));
    
    await notifyCitizenOnResolution({
      type: 'grievance',
      action: 'resolved',
      grievanceId: 'GRV00000001',
      citizenName: 'Test Citizen',
      citizenPhone: '919356150561',
      citizenWhatsApp: '919356150561',
      departmentId: department._id.toString(),
      companyId: company._id.toString(),
      remarks: 'Issue has been resolved successfully. Water supply restored.'
    });

    console.log('\n✅ Test 3 completed\n');

    // Test 4: Hierarchy Notification on Resolution
    console.log('📧 Test 4: Hierarchy Notification on Resolution');
    console.log('='.repeat(60));
    
    await notifyHierarchyOnStatusChange({
      type: 'grievance',
      action: 'resolved',
      grievanceId: 'GRV00000001',
      citizenName: 'Test Citizen',
      citizenPhone: '919356150561',
      departmentId: department._id.toString(),
      companyId: company._id.toString(),
      assignedTo: testUser._id.toString(),
      remarks: 'Issue resolved'
    }, 'PENDING', 'RESOLVED');

    console.log('\n✅ Test 4 completed\n');

    console.log('='.repeat(60));
    console.log('✅ All notification tests completed!');
    console.log('📧 Check email inboxes');
    console.log('📱 Check WhatsApp messages');
    console.log('📋 Check server logs for details');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testNotifications();
