import express from 'express';
import { BookingController } from './booking.controller';
import { auth } from '../../middleware/auth'; // Apnar project layer location validation rule check korun
import { Role } from '../../../generated/prisma/enums';

const router = express.Router();

// Shudhu Tenant-ra rental application generate request korte parbe
router.post('/request', auth( Role.TENANT ), BookingController.createBookingRequest);

// Logged-in credentials match loop validation data pull logic
router.get('/my-bookings', auth( Role.TENANT, Role.LANDLORD ), BookingController.getMyBookings);

// Individual index key filter data single item record fetch block
router.get('/:id', auth( Role.TENANT, Role.LANDLORD, Role.ADMIN ), BookingController.getBookingById);

// Landlord dynamic status toggle processing path selector
router.patch('/status/:id', auth( Role.LANDLORD), BookingController.handleBookingStatusUpdate);

export const BookingRoutes = router;
