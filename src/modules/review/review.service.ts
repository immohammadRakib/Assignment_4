import { ICreateReviewPayload } from "./review.interface";
import { prisma } from "../../lib/prisma";





const createReview = async (tenantId: string, payload: ICreateReviewPayload) => {
    const { propertyId, rating, comment } = payload;

   const hasPaid = await prisma.payment.findFirst({
        where: {
            status: "PAID",
            booking: {
                id: (payload as any).bookingId, 
                propertyId: propertyId,          
                tenantId: tenantId               
            }
        }
    });

    if (!hasPaid) {
        throw new Error("You cannot review this property because you haven't booked or paid for it!");
    }

    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5!");
    }

    const result = await prisma.review.create({
        data: {
            propertyId,
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





export const ReviewService = {
    createReview,
    getPropertyReviews
};
