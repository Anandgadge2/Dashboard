import dotenv from 'dotenv';
import User from '../models/User';
import { UserRole } from '../config/constants';
import { connectDatabase } from '../config/database';
import { logger } from '../config/logger';

// Load environment variables
dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Check if SuperAdmin already exists
    const existingSuperAdmin = await User.findOne({ role: UserRole.SUPER_ADMIN });

    if (existingSuperAdmin) {
      logger.info('SuperAdmin already exists:');
      logger.info(`Email: ${existingSuperAdmin.email}`);
      logger.info(`Name: ${existingSuperAdmin.getFullName()}`);
      
      // Ask if user wants to delete and recreate
      logger.warn('To create a new SuperAdmin, delete the existing one first');
      process.exit(0);
    }

    // Create SuperAdmin user
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@platform.com',
      phone: '0000000000', // Required field - update with actual phone number if needed
      password: '111111', // Will be hashed automatically by pre-save hook
      role: UserRole.SUPER_ADMIN,
      isActive: true
    });

    logger.info('✅ SuperAdmin created successfully!');
    logger.info('='.repeat(50));
    logger.info(`User ID: ${superAdmin.userId}`);
    logger.info(`Email: ${superAdmin.email}`);
    logger.info(`Password: 111111`);
    logger.info(`Name: ${superAdmin.getFullName()}`);
    logger.info(`Role: ${superAdmin.role}`);
    logger.info('='.repeat(50));
    logger.info('⚠️  IMPORTANT: Change the password after first login!');

    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed SuperAdmin:', error);
    process.exit(1);
  }
};

// Run the seed function
seedSuperAdmin();
