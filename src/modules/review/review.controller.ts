import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";





// Create Review
const createReview = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.user?.id;; 
    
    const result = await ReviewService.createReview( tenantId as string, req.body );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Review submitted successfully",
        data: result
    });
});




// Get Reviews by Property
const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    
    const result = await ReviewService.getPropertyReviews( propertyId as string );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Property reviews fetched successfully",
        data: result
    });
});




// Delete Review by Tenant
const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.user?.id; 
    const { reviewId } = req.params;

    await ReviewService.deleteReviewByTenant(reviewId as string, tenantId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review deleted successfully",
        data: null
    });
});




export const ReviewController = {
    createReview,
    getPropertyReviews,
    deleteReview
};
