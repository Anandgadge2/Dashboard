import { Router, Request, Response } from 'express';
import AppointmentAvailability, { IAppointmentAvailability, ISpecialDate } from '../models/AppointmentAvailability';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';

const router = Router();

// Get availability settings for a company/department
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.query;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const query: any = { companyId };
    if (departmentId) {
      query.departmentId = departmentId;
    } else {
      query.departmentId = { $exists: false };
    }

    let availability = await AppointmentAvailability.findOne(query)
      .populate('departmentId', 'name');

    // If no availability exists, create default one
    if (!availability) {
      availability = await AppointmentAvailability.create({
        companyId,
        departmentId: departmentId || undefined
      });
    }

    return res.json({ availability });
  } catch (error: any) {
    logger.error('Error fetching availability:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get public availability (for chatbot)
router.get('/public/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { departmentId } = req.query;

    const query: any = { companyId, isActive: true };
    if (departmentId) {
      query.departmentId = departmentId;
    } else {
      query.departmentId = { $exists: false };
    }

    const availability = await AppointmentAvailability.findOne(query);

    if (!availability) {
      // Return default availability
      return res.json({
        success: true,
        data: {
          availability: {
            weeklySchedule: {
              sunday: { isAvailable: false },
              monday: { isAvailable: true, morning: { enabled: true, startTime: '09:00', endTime: '12:00' }, afternoon: { enabled: true, startTime: '14:00', endTime: '17:00' }, evening: { enabled: false } },
              tuesday: { isAvailable: true, morning: { enabled: true, startTime: '09:00', endTime: '12:00' }, afternoon: { enabled: true, startTime: '14:00', endTime: '17:00' }, evening: { enabled: false } },
              wednesday: { isAvailable: true, morning: { enabled: true, startTime: '09:00', endTime: '12:00' }, afternoon: { enabled: true, startTime: '14:00', endTime: '17:00' }, evening: { enabled: false } },
              thursday: { isAvailable: true, morning: { enabled: true, startTime: '09:00', endTime: '12:00' }, afternoon: { enabled: true, startTime: '14:00', endTime: '17:00' }, evening: { enabled: false } },
              friday: { isAvailable: true, morning: { enabled: true, startTime: '09:00', endTime: '12:00' }, afternoon: { enabled: true, startTime: '14:00', endTime: '17:00' }, evening: { enabled: false } },
              saturday: { isAvailable: false }
            },
            specialDates: [],
            slotDurationMinutes: 30,
            maxAdvanceBookingDays: 30
          }
        }
      });
    }

    return res.json({
      success: true,
      data: { availability }
    });
  } catch (error: any) {
    logger.error('Error fetching public availability:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get available dates for a month (for chatbot)
router.get('/available-dates/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { departmentId, month, year } = req.query;
    
    const targetMonth = parseInt(month as string) || new Date().getMonth();
    const targetYear = parseInt(year as string) || new Date().getFullYear();

    const query: any = { companyId, isActive: true };
    if (departmentId) {
      query.departmentId = departmentId;
    } else {
      query.departmentId = { $exists: false };
    }

    const availability = await AppointmentAvailability.findOne(query);
    
    const availableDates: { date: string; slots: string[] }[] = [];
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      
      // Skip past dates
      if (date < today) continue;
      
      // Skip dates beyond max advance booking
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + (availability?.maxAdvanceBookingDays || 30));
      if (date > maxDate) continue;

      const dayOfWeek = date.getDay();
      const dayName = dayNames[dayOfWeek] as 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
      
      // Check for special dates (holidays)
      const specialDate = availability?.specialDates?.find(sd => {
        const sdDate = new Date(sd.date);
        return sdDate.getFullYear() === date.getFullYear() &&
               sdDate.getMonth() === date.getMonth() &&
               sdDate.getDate() === date.getDate();
      });

      if (specialDate) {
        if (!specialDate.isAvailable) continue; // Holiday
        // Use special date timings if available
      } else if (availability) {
        const daySchedule = availability.weeklySchedule[dayName];
        if (!daySchedule?.isAvailable) continue;
      } else {
        // Default: weekdays only
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      }

      // Generate time slots
      const slots: string[] = [];
      const daySchedule = availability?.weeklySchedule[dayName] || {
        morning: { enabled: true, startTime: '09:00', endTime: '12:00' },
        afternoon: { enabled: true, startTime: '14:00', endTime: '17:00' },
        evening: { enabled: false }
      };

      if (daySchedule.morning?.enabled) {
        slots.push(`${daySchedule.morning.startTime}-${daySchedule.morning.endTime}`);
      }
      if (daySchedule.afternoon?.enabled) {
        slots.push(`${daySchedule.afternoon.startTime}-${daySchedule.afternoon.endTime}`);
      }
      if (daySchedule.evening?.enabled) {
        slots.push(`${daySchedule.evening.startTime}-${daySchedule.evening.endTime}`);
      }

      if (slots.length > 0) {
        availableDates.push({
          date: date.toISOString().split('T')[0],
          slots
        });
      }
    }

    return res.json({ availableDates });
  } catch (error: any) {
    logger.error('Error fetching available dates:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update availability settings
router.put('/', authenticate, async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { departmentId, ...updateData } = req.body;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const query: any = { companyId };
    if (departmentId) {
      query.departmentId = departmentId;
    } else {
      query.departmentId = { $exists: false };
    }

    const availability = await AppointmentAvailability.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, upsert: true }
    );

    logger.info(`Availability settings updated for company ${companyId}`);

    return res.json({ availability });
  } catch (error: any) {
    logger.error('Error updating availability:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Add special date (holiday or custom)
router.post('/special-date', authenticate, async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { departmentId, specialDate } = req.body;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const query: any = { companyId };
    if (departmentId) {
      query.departmentId = departmentId;
    } else {
      query.departmentId = { $exists: false };
    }

    const availability = await AppointmentAvailability.findOneAndUpdate(
      query,
      { $push: { specialDates: specialDate } },
      { new: true, upsert: true }
    );

    logger.info(`Special date added for company ${companyId}: ${specialDate.date}`);

    return res.json({ availability });
  } catch (error: any) {
    logger.error('Error adding special date:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Remove special date
router.delete('/special-date', authenticate, async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { departmentId, date } = req.body;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required' });
    }

    const query: any = { companyId };
    if (departmentId) {
      query.departmentId = departmentId;
    } else {
      query.departmentId = { $exists: false };
    }

    const targetDate = new Date(date);

    const availability = await AppointmentAvailability.findOneAndUpdate(
      query,
      { 
        $pull: { 
          specialDates: { 
            date: { 
              $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
              $lt: new Date(targetDate.setHours(23, 59, 59, 999))
            }
          } 
        } 
      },
      { new: true }
    );

    logger.info(`Special date removed for company ${companyId}: ${date}`);

    return res.json({ availability });
  } catch (error: any) {
    logger.error('Error removing special date:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get Indian holidays for a year
router.get('/holidays/:year', async (req: Request, res: Response) => {
  try {
    const { year } = req.params;
    const targetYear = parseInt(year) || new Date().getFullYear();

    // Common Indian national holidays (dates vary slightly each year)
    const holidays = [
      { date: `${targetYear}-01-26`, name: 'Republic Day', type: 'national' },
      { date: `${targetYear}-03-08`, name: 'Maha Shivaratri', type: 'religious' },
      { date: `${targetYear}-03-25`, name: 'Holi', type: 'religious' },
      { date: `${targetYear}-04-14`, name: 'Ambedkar Jayanti', type: 'national' },
      { date: `${targetYear}-04-17`, name: 'Ram Navami', type: 'religious' },
      { date: `${targetYear}-04-21`, name: 'Mahavir Jayanti', type: 'religious' },
      { date: `${targetYear}-05-01`, name: 'May Day', type: 'national' },
      { date: `${targetYear}-05-23`, name: 'Buddha Purnima', type: 'religious' },
      { date: `${targetYear}-06-17`, name: 'Eid ul-Fitr', type: 'religious' },
      { date: `${targetYear}-07-17`, name: 'Muharram', type: 'religious' },
      { date: `${targetYear}-08-15`, name: 'Independence Day', type: 'national' },
      { date: `${targetYear}-08-26`, name: 'Janmashtami', type: 'religious' },
      { date: `${targetYear}-09-16`, name: 'Milad un-Nabi', type: 'religious' },
      { date: `${targetYear}-10-02`, name: 'Gandhi Jayanti', type: 'national' },
      { date: `${targetYear}-10-12`, name: 'Dussehra', type: 'religious' },
      { date: `${targetYear}-10-31`, name: 'Diwali', type: 'religious' },
      { date: `${targetYear}-11-01`, name: 'Diwali Holiday', type: 'religious' },
      { date: `${targetYear}-11-15`, name: 'Guru Nanak Jayanti', type: 'religious' },
      { date: `${targetYear}-12-25`, name: 'Christmas', type: 'religious' }
    ];

    return res.json({ holidays, year: targetYear });
  } catch (error: any) {
    logger.error('Error fetching holidays:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
