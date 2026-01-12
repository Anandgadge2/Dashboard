import mongoose from 'mongoose';
import User from '../models/User';
import Company from '../models/Company';
import bcrypt from 'bcryptjs';
import { UserRole } from '../config/constants';

const fixZPAdminPassword = async () => {
  try {
    console.log('🔧 Fixing ZP Amaravati admin password...');

    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard');
      console.log('✅ Connected to database');
    }

    // Find ZP Amaravati company
    const zpCompany = await Company.findOne({ name: 'ZP Amaravati' });
    if (!zpCompany) {
      console.log('❌ ZP Amaravati company not found. Please run seed:zpamaravati first.');
      return;
    }

    console.log('✅ Found ZP Amaravati company:', zpCompany.companyId);

    // Find or create company admin
    const adminEmail = 'ceo@zpamaravati.gov.in';
    let admin = await User.findOne({ email: adminEmail }).select('+password');

    if (!admin) {
      console.log('📝 Creating company admin user...');
      admin = await User.create({
        firstName: 'Anand',
        lastName: 'Jadhav',
        email: adminEmail,
        password: 'Admin@123', // Pre-save hook will hash it
        phone: '+91-9876543200',
        role: UserRole.COMPANY_ADMIN,
        companyId: zpCompany._id,
        isActive: true,
        isEmailVerified: true,
        isDeleted: false
      });
      console.log('✅ Company admin created:', admin.email);
    } else {
      console.log('✅ Company admin found:', admin.email);
      console.log('📝 Resetting password...');
      
      // Reset password - set as plain text, pre-save hook will hash it
      admin.password = 'Admin@123';
      admin.isActive = true;
      admin.isDeleted = false;
      await admin.save();
      console.log('✅ Password reset successfully');
    }

    // Verify password works - reload user to get fresh password hash
    const freshAdmin = await User.findOne({ email: adminEmail }).select('+password');
    if (freshAdmin) {
      const testPassword = await freshAdmin.comparePassword('Admin@123');
      if (testPassword) {
        console.log('✅ Password verification successful');
      } else {
        console.log('❌ Password verification failed - this should not happen!');
      }
    }

    // Also fix department admins
    const departmentAdmins = [
      {
        email: 'revenue.admin@zpamaravati.gov.in',
        firstName: 'Ramesh',
        lastName: 'Kumar',
        phone: '+91-9876543210'
      },
      {
        email: 'health.admin@zpamaravati.gov.in',
        firstName: 'Sunita',
        lastName: 'Patil',
        phone: '+91-9876543211'
      },
      {
        email: 'water.admin@zpamaravati.gov.in',
        firstName: 'Vijay',
        lastName: 'Sharma',
        phone: '+91-9876543212'
      }
    ];

    for (const deptAdmin of departmentAdmins) {
      let user = await User.findOne({ email: deptAdmin.email }).select('+password');
      
      if (!user) {
        console.log(`📝 Creating department admin: ${deptAdmin.email}`);
        user = await User.create({
          ...deptAdmin,
          password: 'Admin@123', // Pre-save hook will hash it
          role: UserRole.DEPARTMENT_ADMIN,
          companyId: zpCompany._id,
          isActive: true,
          isEmailVerified: true,
          isDeleted: false
        });
        console.log(`✅ Department admin created: ${user.email}`);
      } else {
        console.log(`📝 Resetting password for: ${deptAdmin.email}`);
        // Set as plain text, pre-save hook will hash it
        user.password = 'Admin@123';
        user.isActive = true;
        user.isDeleted = false;
        await user.save();
        console.log(`✅ Password reset for: ${user.email}`);
      }
    }

    console.log('\n🎉 Password fix completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Company Admin: ceo@zpamaravati.gov.in / Admin@123');
    console.log('Department Admins:');
    console.log('- revenue.admin@zpamaravati.gov.in / Admin@123');
    console.log('- health.admin@zpamaravati.gov.in / Admin@123');
    console.log('- water.admin@zpamaravati.gov.in / Admin@123');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

// Run the fix function
if (require.main === module) {
  fixZPAdminPassword()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default fixZPAdminPassword;
