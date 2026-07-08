import express from 'express';
import { BookingController } from './booking.controller';
import { auth } from '../../middleware/auth';
import { Role } from '../../../generated/prisma/enums';





const rentalRouter = express.Router();




//  Submit a rental request
rentalRouter.post(
    '/', 
    auth(Role.TENANT), 
    BookingController.createBookingRequest
);

//  Get user's own rental requests history
rentalRouter.get(
    '/', 
    auth(Role.TENANT), 
    BookingController.getMyBookings
);



// Get Her propery rental Request
rentalRouter.get(
    '/landlord/requests', 
    auth(Role.LANDLORD), 
    BookingController.getMyBookings
);

// Get all rental requests (Admin only)
rentalRouter.get(
    '/admin/all-requests', 
    auth(Role.ADMIN), 
    BookingController.getMyBookings
);



//  Approve or reject a rental request -> PATCH /api/landlord/requests/:id
rentalRouter.patch(
    '/landlord/requests/:id', 
    auth(Role.LANDLORD), 
    BookingController.handleBookingStatusUpdate
);



// Get individual rental request details
rentalRouter.get(
    '/:id', 
    auth(Role.TENANT, Role.LANDLORD, Role.ADMIN), 
    BookingController.getBookingById
);



export const RentalRoutes = rentalRouter;
