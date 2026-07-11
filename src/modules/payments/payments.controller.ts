import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payments.service";
import config from "../../config";

// Create a payment intent for a booking
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
    const user = req.user; 
    const { bookingId } = req.body;

    if (!bookingId) {
        throw new Error("Booking ID is required to initiate payment.");
    }

    const paymentSession = await paymentService.initialPayment(bookingId, user as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment session created successfully",
        data: paymentSession, 
    });
});

// Confirm payment after redirection from SSLCommerz
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
    const { tranId, bookingId } = req.query;
    const paymentResponse = req.body || {}; 

    const finalTranId = (tranId || paymentResponse.tran_id) as string;
    const finalBookingId = (bookingId || paymentResponse.value_a) as string;

    const result = await paymentService.verifyPayment(
        finalTranId, 
        finalBookingId, 
        paymentResponse
    );

    const frontendBaseUrl = process.env.CLIENT_URL || "http://localhost:5000"; 

    if (result.success) {
        
        return res.redirect(`${frontendBaseUrl}/payment/success?tranId=${finalTranId}&status=success`);
    } else {
        return res.redirect(`${frontendBaseUrl}/payment/fail?tranId=${finalTranId}&status=fail`);
    }
});

// Fail payment after redirection from SSLCommerz
const failPayment = catchAsync(async (req: Request, res: Response) => {
    const { tranId, bookingId } = req.query;
    const paymentResponse = req.body || {};

    const finalTranId = (tranId || paymentResponse.tran_id) as string;
    const finalBookingId = (bookingId || paymentResponse.value_a) as string; 

    await paymentService.handleFailedPaymentInDB(finalTranId, finalBookingId);

  
    const frontendBaseUrl = process.env.CLIENT_URL || "http://localhost:5000";

   
    return res.redirect(`${frontendBaseUrl}/payment/fail?tranId=${finalTranId}&status=fail`);
});

// Cancel payment after redirection from SSLCommerz
const cancelPayment = catchAsync(async (req: Request, res: Response) => {
    const { tranId, bookingId } = req.query;
    const paymentResponse = req.body || {};

    const finalTranId = (tranId || paymentResponse.tran_id) as string;
    const finalBookingId = (bookingId || paymentResponse.value_a) as string; 

    await paymentService.handleCancelledPaymentInDB(finalTranId, finalBookingId);

    const frontendBaseUrl = process.env.CLIENT_URL || "http://localhost:5000";

    return res.redirect(`${frontendBaseUrl}/payment/cancel?tranId=${finalTranId}&status=cancel`);
});

// Get payment history for the authenticated user based on role
const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const role = req.user?.role; 

    const result = await paymentService.getPaymentHistoryFromDB(userId as string, role as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `${role} payment history retrieved successfully`,
        data: result,
    });
});

// Get specific payment details by ID
const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role; 

    const result = await paymentService.getPaymentDetailsFromDB(
        id as string, 
        userId as string, 
        role as string
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment details retrieved successfully",
        data: result,
    });
});

export const PaymentController = {
    createPaymentIntent,
    confirmPayment,
    getPaymentHistory,
    getPaymentDetails,
    failPayment,
    cancelPayment
};
