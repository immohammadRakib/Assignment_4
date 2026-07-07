import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createReview = catchAsync(async (req: Request, res: Response) => {
    const tenantId = (req as any).user.id; 
    
    const result = await ReviewService.createReview(tenantId, req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Review submitted successfully",
        data: result
    });
});



const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    
    const result = await ReviewService.getPropertyReviews( propertyId as string );

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Property reviews fetched successfully",
        data: result
    });
});



export const ReviewController = {
    createReview,
    getPropertyReviews
};
