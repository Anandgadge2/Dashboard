import mongoose from 'mongoose';
import Company from '../models/Company';
import Department from '../models/Department';
import User from '../models/User';
import Grievance from '../models/Grievance';
import Appointment from '../models/Appointment';
import { CompanyType, UserRole, GrievanceStatus, AppointmentStatus } from '../config/constants';
import bcrypt from 'bcryptjs';

// Realistic Indian names for citizens
const citizenNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Devi', 'Vikram Singh',
  'Anjali Gupta', 'Ravi Verma', 'Kavita Yadav', 'Suresh Tiwari', 'Meera Joshi',
  'Nikhil Agarwal', 'Deepika Reddy', 'Arjun Malhotra', 'Pooja Nair', 'Rohit Iyer',
  'Swati Menon', 'Karan Kapoor', 'Neha Desai', 'Aditya Shah', 'Divya Rao',
  'Manish Chawla', 'Shruti Mehta', 'Vishal Jain', 'Riya Agarwal', 'Harsh Trivedi',
  'Anita Pandey', 'Gaurav Saxena', 'Kiran Bhatt', 'Rahul Dutta', 'Sneha Kulkarni',
  'Mohit Agarwal', 'Tanvi Shah', 'Abhishek Reddy', 'Nisha Patel', 'Varun Kumar',
  'Sakshi Gupta', 'Kunal Singh', 'Aarti Sharma', 'Prateek Verma', 'Isha Joshi'
];

// Realistic phone numbers (Indian format)
const generatePhone = () => {
  const prefixes = ['9876', '9765', '9654', '9543', '9432', '9321', '9210', '9109'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `+91-${prefix}${suffix}`;
};

// Realistic addresses in Amaravati region
const addresses = [
  'Ward No. 5, Amaravati City, Maharashtra',
  'Near Bus Stand, Amaravati, Maharashtra',
  'Gandhi Nagar, Amaravati, Maharashtra',
  'Shivaji Chowk, Amaravati, Maharashtra',
  'Rajendra Nagar, Amaravati, Maharashtra',
  'Vidya Nagar, Amaravati, Maharashtra',
  'Industrial Area, Amaravati, Maharashtra',
  'Civil Lines, Amaravati, Maharashtra',
  'New Colony, Amaravati, Maharashtra',
  'Old City, Amaravati, Maharashtra'
];

// Realistic grievance descriptions by department
const grievanceTemplates: Record<string, string[]> = {
  'Revenue Department': [
    'Property tax assessment issue - incorrect calculation for my property',
    'Land record correction needed - wrong survey number in records',
    'Income certificate application pending for 2 months',
    'Caste certificate verification required urgently',
    'Property mutation not processed despite submitting all documents',
    'Tax receipt not received after payment made 3 weeks ago',
    'Land ownership dispute - need clarification on records',
    'Revenue stamp issue - wrong denomination charged'
  ],
  'Health Department': [
    'No ambulance available during emergency - need better response time',
    'Primary Health Center lacks basic medicines',
    'Vaccination camp not organized in our area',
    'Hospital staff not available during night hours',
    'Medical certificate not issued despite multiple visits',
    'Health card application pending for 1 month',
    'Sanitation issue near hospital - garbage not cleared',
    'Need regular health checkup camp in our village'
  ],
  'Water Supply Department': [
    'No water supply for past 5 days in our area',
    'Water quality issue - water is muddy and not fit for drinking',
    'Water pipeline leakage in our street - wasting water',
    'Irregular water supply timing - need fixed schedule',
    'Water connection application pending for 3 months',
    'Water pressure is very low - cannot fill overhead tank',
    'Borewell not working in our locality',
    'Water tanker not coming regularly to our area'
  ],
  'Education Department': [
    'School building needs repair - roof leaking during monsoon',
    'Mid-day meal quality is poor - children not eating',
    'Teacher shortage in primary school - need more teachers',
    'School bus not available for remote areas',
    'Scholarship application pending for 2 months',
    'School infrastructure needs improvement - no proper toilets',
    'Library books are outdated - need new books',
    'Sports equipment not available in school'
  ],
  'Agriculture Department': [
    'Crop insurance claim not processed - submitted 2 months ago',
    'Need agricultural extension officer visit for crop disease',
    'Subsidy on seeds not received despite application',
    'Soil testing facility not available in nearby area',
    'Farmer loan application pending for approval',
    'Irrigation water not reaching our fields',
    'Need training on organic farming techniques',
    'Crop damage compensation not received after flood'
  ],
  'Public Works Department': [
    'Road in bad condition - full of potholes causing accidents',
    'Street lights not working in our area - safety concern',
    'Drainage system blocked - water logging during rain',
    'Bridge repair needed urgently - dangerous for vehicles',
    'Footpath construction incomplete - pedestrians at risk',
    'Public park maintenance required - equipment broken',
    'Road widening work pending for 6 months',
    'Culvert damaged - needs immediate repair'
  ],
  'Social Welfare Department': [
    'Old age pension not received for 3 months',
    'Widow pension application pending for 2 months',
    'Disability certificate not issued despite medical proof',
    'Below Poverty Line (BPL) card application pending',
    'Maternity benefit not received after application',
    'Scholarship for SC/ST students not disbursed',
    'Housing scheme application status unknown',
    'Ration card correction needed - wrong family members listed'
  ],
  'Urban Development Department': [
    'Building plan approval pending for 4 months',
    'Encroachment on public land - need action',
    'Garbage collection not regular in our area',
    'Sewage line blocked - causing health issues',
    'Parking space needed near market area',
    'Public toilet construction needed in busy area',
    'Street vendor license application pending',
    'Building violation complaint - unauthorized construction'
  ]
};

// Realistic appointment purposes by department
const appointmentPurposes: Record<string, string[]> = {
  'Revenue Department': [
    'Property tax payment consultation',
    'Land record verification',
    'Income certificate collection',
    'Caste certificate application',
    'Property mutation inquiry',
    'Revenue stamp purchase',
    'Land survey inquiry',
    'Tax assessment discussion'
  ],
  'Health Department': [
    'Health card collection',
    'Medical certificate application',
    'Vaccination inquiry',
    'Health camp registration',
    'Medicine availability check',
    'Hospital admission inquiry',
    'Health scheme enrollment',
    'Medical report collection'
  ],
  'Water Supply Department': [
    'New water connection application',
    'Water bill payment inquiry',
    'Water quality complaint',
    'Connection transfer application',
    'Water supply timing discussion',
    'Pipeline repair request',
    'Water tanker booking',
    'Meter reading issue'
  ],
  'Education Department': [
    'School admission inquiry',
    'Scholarship application',
    'Transfer certificate collection',
    'School fee concession application',
    'Mid-day meal inquiry',
    'School bus route inquiry',
    'Teacher meeting appointment',
    'Education scheme enrollment'
  ],
  'Agriculture Department': [
    'Crop insurance claim submission',
    'Subsidy application inquiry',
    'Soil testing report collection',
    'Farmer loan application',
    'Agricultural training registration',
    'Crop damage assessment',
    'Seed distribution inquiry',
    'Irrigation scheme enrollment'
  ],
  'Public Works Department': [
    'Road repair complaint',
    'Building plan approval inquiry',
    'Infrastructure development discussion',
    'Public facility maintenance request',
    'Construction permit inquiry',
    'Road widening inquiry',
    'Drainage system complaint',
    'Street light installation request'
  ],
  'Social Welfare Department': [
    'Pension application submission',
    'BPL card application',
    'Disability certificate collection',
    'Welfare scheme enrollment',
    'Ration card correction',
    'Housing scheme inquiry',
    'Maternity benefit application',
    'Scholarship collection'
  ],
  'Urban Development Department': [
    'Building plan approval',
    'License application inquiry',
    'Encroachment complaint',
    'Garbage collection request',
    'Parking permit application',
    'Public facility booking',
    'Development plan inquiry',
    'Zoning clarification'
  ]
};

const seedZPAmaravatiData = async () => {
  try {
    console.log('🌱 Seeding comprehensive ZP Amaravati data...');

    // Connect to database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://agadge797_db_user:rAD72YBXkBJTv5xk@cluster0.85mfxwi.mongodb.net/dashboard');
    }

    // Find ZP Amaravati company
    const zpCompany = await Company.findOne({ name: 'ZP Amaravati' });
    if (!zpCompany) {
      console.log('❌ ZP Amaravati company not found. Please run seed:zpamaravati first.');
      return;
    }

    console.log('✅ Found ZP Amaravati company:', zpCompany.companyId);

    // Get or create departments with realistic ZP department names
    let departments = await Department.find({ companyId: zpCompany._id });
    
    if (departments.length === 0) {
      console.log('📋 Creating realistic ZP departments...');
      const departmentData = [
        {
          name: 'Revenue Department',
          description: 'Handles revenue collection, land records, tax assessment, and financial management',
          contactPerson: 'Shri Ramesh Kumar, Revenue Officer',
          contactEmail: 'revenue@zpamaravati.gov.in',
          contactPhone: '+91-2612-220124'
        },
        {
          name: 'Health Department',
          description: 'Manages public health services, hospitals, health programs, and medical facilities',
          contactPerson: 'Dr. Sunita Patil, Chief Medical Officer',
          contactEmail: 'health@zpamaravati.gov.in',
          contactPhone: '+91-2612-220125'
        },
        {
          name: 'Water Supply Department',
          description: 'Responsible for water supply, sanitation, water conservation, and pipeline maintenance',
          contactPerson: 'Shri Vijay Sharma, Water Supply Officer',
          contactEmail: 'water@zpamaravati.gov.in',
          contactPhone: '+91-2612-220126'
        },
        {
          name: 'Education Department',
          description: 'Manages schools, colleges, educational programs, and scholarship schemes',
          contactPerson: 'Shri Prakash Deshmukh, Education Officer',
          contactEmail: 'education@zpamaravati.gov.in',
          contactPhone: '+91-2612-220127'
        },
        {
          name: 'Agriculture Department',
          description: 'Handles agricultural development, farmer welfare, crop management, and subsidies',
          contactPerson: 'Shri Mahesh Wankhede, Agriculture Officer',
          contactEmail: 'agriculture@zpamaravati.gov.in',
          contactPhone: '+91-2612-220128'
        },
        {
          name: 'Public Works Department',
          description: 'Manages infrastructure development, roads, bridges, and public construction',
          contactPerson: 'Shri Rajesh Thakur, PWD Officer',
          contactEmail: 'pwd@zpamaravati.gov.in',
          contactPhone: '+91-2612-220129'
        },
        {
          name: 'Social Welfare Department',
          description: 'Handles social security, welfare schemes, pensions, and poverty alleviation',
          contactPerson: 'Shri Anjali Meshram, Welfare Officer',
          contactEmail: 'welfare@zpamaravati.gov.in',
          contactPhone: '+91-2612-220130'
        },
        {
          name: 'Urban Development Department',
          description: 'Manages urban planning, municipal services, building approvals, and city development',
          contactPerson: 'Shri Nitin Bansod, Urban Development Officer',
          contactEmail: 'urban@zpamaravati.gov.in',
          contactPhone: '+91-2612-220131'
        }
      ];

      for (const dept of departmentData) {
        const department = await Department.create({
          ...dept,
          companyId: zpCompany._id,
          isActive: true,
          isDeleted: false
        });
        departments.push(department);
        console.log(`✅ Department created: ${department.name}`);
      }
    } else {
      console.log(`✅ Found ${departments.length} existing departments`);
    }

    // Create operators for each department
    console.log('👥 Creating operators for departments...');
    const operators = [];
    for (const dept of departments) {
      const existingOperators = await User.countDocuments({ 
        departmentId: dept._id, 
        role: UserRole.OPERATOR 
      });
      
      if (existingOperators === 0) {
        const operatorNames = [
          ['Rajesh', 'Singh'], ['Priya', 'Sharma'], ['Amit', 'Patel'],
          ['Sunita', 'Devi'], ['Vikram', 'Kumar']
        ];
        
        const [firstName, lastName] = operatorNames[Math.floor(Math.random() * operatorNames.length)];
        const hashedPassword = await bcrypt.hash('Operator@123', 10);
        
        const operator = await User.create({
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${dept.name.toLowerCase().replace(/\s+/g, '')}.zpamaravati.gov.in`,
          password: hashedPassword,
          phone: generatePhone(),
          role: UserRole.OPERATOR,
          companyId: zpCompany._id,
          departmentId: dept._id,
          isActive: true,
          isEmailVerified: true
        });
        operators.push(operator);
        console.log(`✅ Operator created: ${operator.firstName} ${operator.lastName} for ${dept.name}`);
      }
    }

    // Get all operators and department admins for assignment
    const allUsers = await User.find({ 
      companyId: zpCompany._id,
      role: { $in: [UserRole.OPERATOR, UserRole.DEPARTMENT_ADMIN] }
    });

    // Create realistic grievances
    console.log('📝 Creating realistic grievances...');
    const existingGrievances = await Grievance.countDocuments({ companyId: zpCompany._id });
    
    if (existingGrievances === 0) {
      const grievancesToCreate = 150; // Create 150 grievances
      const statuses = [
        GrievanceStatus.PENDING,
        GrievanceStatus.ASSIGNED,
        GrievanceStatus.RESOLVED
      ];
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      
      // Get starting count for grievanceId generation
      let grievanceCounter = existingGrievances;
      
      for (let i = 0; i < grievancesToCreate; i++) {
        const dept = departments[Math.floor(Math.random() * departments.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const citizenName = citizenNames[Math.floor(Math.random() * citizenNames.length)];
        const phone = generatePhone();
        const templates = grievanceTemplates[dept.name] || ['General complaint'];
        const description = templates[Math.floor(Math.random() * templates.length)];
        
        // Assign to operator if status is not PENDING
        let assignedTo = null;
        let assignedAt = null;
        if (status !== GrievanceStatus.PENDING) {
          const deptUsers = allUsers.filter(u => 
            u.departmentId?.toString() === dept._id.toString()
          );
          if (deptUsers.length > 0) {
            assignedTo = deptUsers[Math.floor(Math.random() * deptUsers.length)]._id;
            assignedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
          }
        }

        // Create date in last 60 days
        const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
        
        // Status history
        const statusHistory = [{
          status: GrievanceStatus.PENDING,
          changedAt: createdAt
        }];
        
        if (status !== GrievanceStatus.PENDING) {
          statusHistory.push({
            status,
            changedAt: assignedAt || new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
            ...(assignedTo && { changedBy: assignedTo })
          } as any);
        }

        // Resolved dates
        let resolvedAt = null;
        let closedAt = null;
        if (status === GrievanceStatus.RESOLVED) {
          resolvedAt = new Date(createdAt.getTime() + (3 + Math.random() * 7) * 24 * 60 * 60 * 1000);
        }

        // Generate grievanceId manually to ensure it's set before validation
        grievanceCounter++;
        const grievanceId = `GRV${String(grievanceCounter).padStart(8, '0')}`;

        const grievance = await Grievance.create({
          grievanceId,
          companyId: zpCompany._id,
          departmentId: dept._id,
          citizenName,
          citizenPhone: phone,
          citizenWhatsApp: phone,
          description,
          category: dept.name,
          priority,
          status,
          statusHistory,
          assignedTo,
          assignedAt,
          location: {
            type: 'Point',
            coordinates: [
              77.75 + (Math.random() - 0.5) * 0.1, // Longitude around Amaravati
              20.93 + (Math.random() - 0.5) * 0.1  // Latitude around Amaravati
            ],
            address: addresses[Math.floor(Math.random() * addresses.length)]
          },
          media: [],
          resolution: status === GrievanceStatus.RESOLVED
            ? 'Issue has been resolved. Citizen satisfied with the resolution.'
            : undefined,
          resolvedAt,
          closedAt,
          slaBreached: Math.random() > 0.8, // 20% chance of SLA breach
          slaDueDate: new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000),
          isDeleted: false,
          createdAt,
          updatedAt: status === GrievanceStatus.RESOLVED 
            ? resolvedAt 
            : new Date()
        });

        if ((i + 1) % 25 === 0) {
          console.log(`✅ Created ${i + 1} grievances...`);
        }
      }
      console.log(`✅ Created ${grievancesToCreate} grievances`);
    } else {
      console.log(`✅ ${existingGrievances} grievances already exist`);
    }

    // Create realistic appointments
    console.log('📅 Creating realistic appointments...');
    const existingAppointments = await Appointment.countDocuments({ companyId: zpCompany._id });
    
    if (existingAppointments === 0) {
      const appointmentsToCreate = 100; // Create 100 appointments
      const statuses = [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED
      ];
      
      // Get starting count for appointmentId generation
      let appointmentCounter = existingAppointments;
      
      for (let i = 0; i < appointmentsToCreate; i++) {
        const dept = departments[Math.floor(Math.random() * departments.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const citizenName = citizenNames[Math.floor(Math.random() * citizenNames.length)];
        const phone = generatePhone();
        const purposes = appointmentPurposes[dept.name] || ['General inquiry'];
        const purpose = purposes[Math.floor(Math.random() * purposes.length)];
        
        // Assign to operator if status is not SCHEDULED
        let assignedTo = null;
        if (status !== AppointmentStatus.SCHEDULED) {
          const deptUsers = allUsers.filter(u => 
            u.departmentId?.toString() === dept._id.toString()
          );
          if (deptUsers.length > 0) {
            assignedTo = deptUsers[Math.floor(Math.random() * deptUsers.length)]._id;
          }
        }

        // Create appointment date (past, today, or future)
        const daysOffset = Math.floor(Math.random() * 60) - 15; // -15 to +45 days
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + daysOffset);
        
        // Appointment time (9 AM to 5 PM)
        const hour = 9 + Math.floor(Math.random() * 8);
        const minute = Math.random() > 0.5 ? 0 : 30;
        const appointmentTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        // Status history
        const statusHistory = [{
          status: AppointmentStatus.SCHEDULED,
          changedAt: createdAt
        }];
        
        if (status !== AppointmentStatus.SCHEDULED) {
          statusHistory.push({
            status,
            changedAt: new Date(createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000),
            ...(assignedTo && { changedBy: assignedTo })
          } as any);
        }

        // Completed/Cancelled dates
        let completedAt = null;
        let cancelledAt = null;
        let cancellationReason = null;
        
        if (status === AppointmentStatus.COMPLETED) {
          completedAt = new Date(appointmentDate.getTime() + (1 + Math.random()) * 60 * 60 * 1000);
        } else if (status === AppointmentStatus.CANCELLED) {
          cancelledAt = new Date(createdAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
          cancellationReason = 'Citizen requested cancellation';
        }

        // Generate appointmentId manually to ensure it's set before validation
        appointmentCounter++;
        const appointmentId = `APT${String(appointmentCounter).padStart(8, '0')}`;

        await Appointment.create({
          appointmentId,
          companyId: zpCompany._id,
          departmentId: dept._id,
          citizenName,
          citizenPhone: phone,
          citizenWhatsApp: phone,
          citizenEmail: `${citizenName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          purpose,
          appointmentDate,
          appointmentTime,
          duration: 30,
          status,
          statusHistory,
          assignedTo,
          location: `${dept.name} Office, Amaravati`,
          notes: status === AppointmentStatus.COMPLETED ? 'Appointment completed successfully' : undefined,
          cancellationReason,
          cancelledAt,
          completedAt,
          isDeleted: false,
          createdAt,
          updatedAt: status === AppointmentStatus.COMPLETED 
            ? completedAt 
            : status === AppointmentStatus.CANCELLED 
            ? cancelledAt 
            : new Date()
        });

        if ((i + 1) % 25 === 0) {
          console.log(`✅ Created ${i + 1} appointments...`);
        }
      }
      console.log(`✅ Created ${appointmentsToCreate} appointments`);
    } else {
      console.log(`✅ ${existingAppointments} appointments already exist`);
    }

    console.log('\n🎉 Comprehensive ZP Amaravati data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Grievances: ${await Grievance.countDocuments({ companyId: zpCompany._id })}`);
    console.log(`- Appointments: ${await Appointment.countDocuments({ companyId: zpCompany._id })}`);
    console.log(`- Users: ${await User.countDocuments({ companyId: zpCompany._id })}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

// Run the seed function
if (require.main === module) {
  seedZPAmaravatiData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedZPAmaravatiData;
