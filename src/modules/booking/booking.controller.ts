import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";




// Create Booking Request
const createBookingRequest = catchAsync(async (req: Request, res: Response) => {
    const id = req.user?.id;
    const payload = req.body;

    const result = await BookingService.createBookingRequest(payload, id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental request submitted successfully",
        data: result
    });
});




// Get My Bookings
const getMyBookings = catchAsync(async (req: Request, res: Response) => {
    const id = req.user?.id;
    const role = req.user?.role;

    const result = await BookingService.getMyBookings(id as string, role as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental history retrieved successfully",
        data: result
    });
});





// Get All Booking for Admin
const getAllBookingsForAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingService.getAllBookingsForAdmin();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All rental requests fetched successfully for admin",
        data: result
    });
});





// Get Booking By Id
const getBookingById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id) {
        throw new Error("Booking Id Required In Params");
    }

    const result = await BookingService.getBookingById(id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Booking details retrieved successfully",
        data: result
    });
});




// Handle Booking Status Update
const handleBookingStatusUpdate = catchAsync(async (req: Request, res: Response) => {
    const landlordId = req.user?.id;
    const { status } = req.body; 
    const id = req.params.id;

    if (!id) {
        throw new Error("Booking Id Required In Params");
    }

    const result = await BookingService.handleBookingStatusUpdate(id as string, landlordId as string, status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Rental request status updated to ${status}`,
        data: result
    });
});





// Cancel Booking By Tenant
const cancelBooking = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.user?.id;
    const { id: bookingId } = req.params; 

    if (!tenantId) {
        throw new Error("Unauthorized access. Tenant ID missing.");
    }

    const result = await BookingService.cancelBookingByTenant(bookingId as string, tenantId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Booking cancelled successfully",
        data: result
    });
});





export const BookingController = {
    createBookingRequest,
    getMyBookings,
    getAllBookingsForAdmin, 
    getBookingById,
    handleBookingStatusUpdate,
    cancelBooking
};
