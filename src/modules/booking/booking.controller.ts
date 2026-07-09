import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";

const createBookingRequest = catchAsync(async (req: Request, res: Response ) => {
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

const getMyBookings = catchAsync(async (req: Request, res: Response ) => {
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

const getBookingById = catchAsync(async (req: Request, res: Response ) => {
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

const handleBookingStatusUpdate = catchAsync(async (req: Request, res: Response ) => {
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

export const BookingController = {
    createBookingRequest,
    getMyBookings,
    getBookingById,
    handleBookingStatusUpdate
};
