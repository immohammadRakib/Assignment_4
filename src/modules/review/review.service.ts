import { ICreateReviewPayload } from "./review.interface";
import { prisma } from "../../lib/prisma";




// Create Review
const createReview = async (tenantId: string, payload: ICreateReviewPayload) => {
    const { propertyId, rating, comment } = payload;
    const bookingId = (payload as any).bookingId;

    if (!bookingId) {
        throw new Error("Booking ID is required to submit a review!");
    }

   const hasPaid = await prisma.payment.findFirst({
        where: {
            status: "PAID",
            booking: {
                id: bookingId,  
                propertyId: propertyId,          
                tenantId: tenantId               
            }
        }
    });

    if (!hasPaid) {
        throw new Error("You cannot review this property because you haven't booked or paid for it!");
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            bookingId: bookingId, 
            tenantId: tenantId
        }
    });

    if (existingReview) {
        throw new Error("You have already submitted a review for this booking slot! Only one review per paid slot is allowed.");
    }

    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5!");
    }

    const result = await prisma.review.create({
        data: {
            propertyId,
            bookingId,
            tenantId,
            rating,
            comment
        },
        include: {
            tenant: {
                select: { name: true } 
            }
        }
    });

    return result;
};




// Get Reviews by Property
const getPropertyReviews = async (propertyId: string) => {
    const propertyExists = await prisma.property.findUnique({
        where: { id: propertyId }
    });

    if (!propertyExists) {
        throw new Error("Property not found!");
    }

    const reviews = await prisma.review.findMany({
        where: { propertyId },
        orderBy: {
            createdAt: "desc" 
        },
        include: {
            tenant: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return reviews;
};




// Delete Review
const deleteReviewByTenant = async (reviewId: string, tenantId: string) => {
    const review = await prisma.review.findUniqueOrThrow({
        where: { id: reviewId }
    });

    if (review.tenantId !== tenantId) {
        throw new Error("You are not authorized to delete this review!");
    }

    await prisma.review.delete({
        where: { id: reviewId }
    });
};




export const ReviewService = {
    createReview,
    getPropertyReviews,
    deleteReviewByTenant
};
