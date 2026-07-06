import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payments.service";

/**
 * Initiates a payment session for an approved rental booking.
 * POST /api/payments/create
 */
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
    const user = req.user; // Authenticated tenant
    const { bookingId } = req.body;

    if (!bookingId) {
        throw new Error("Booking ID is required to initiate payment.");
    }

    // Call service to create session and get the GatewayPageURL
    const paymentSession = await paymentService.initialPayement(bookingId, user as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment session created successfully",
        data: paymentSession, // Contains GatewayPageURL for frontend redirect
    });
});

/**
 * Handles SSLCommerz redirection after successful payment and verifies transaction.
 * POST /api/payments/confirm
 */
// const confirmPayment = catchAsync(async (req: Request, res: Response) => {
//     const { tranId, bookingId } = req.query;
//     const paymentResponse = req.body; // SSLCommerz sends status data in body

//     // Validate the payment using SSLCommerz Order Validation API
//     const result = await paymentService.verifyPayment(
//         tranId as string, 
//         bookingId as string, 
//         paymentResponse
//     );

//     // After verification, redirect the user back to the frontend
//     if (result.success) {
//         res.redirect(`${process.env.FRONTEND_URL}/payment/success?tranId=${tranId}`);
//     } else {
//         res.redirect(`${process.env.FRONTEND_URL}/payment/fail`);
//     }
// });

/**
 * Retrieves the logged-in user's payment history.
 * GET /api/payments
 */
// const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
//     const userId = req.user?.id;
//     const result = await paymentService.getPaymentHistoryFromDB(userId as string);

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Payment history retrieved successfully",
//         data: result,
//     });
// });

/**
 * Retrieves details for a specific payment by its ID.
 * GET /api/payments/:id
 */
// const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const result = await paymentService.getPaymentDetailsFromDB(id);

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Payment details retrieved successfully",
//         data: result,
//     });
// });

export const PaymentController = {
    createPaymentIntent,
    // confirmPayment,
    // getPaymentHistory,
    // getPaymentDetails,
};
