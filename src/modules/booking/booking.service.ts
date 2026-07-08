import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";








const createBookingRequest = async (payload: any, tenantId: string) => {
    const { propertyId, startDate, endDate } = payload;

    const property = await prisma.property.findUniqueOrThrow({
        where: { id: propertyId }
    });

    if (!property.isAvailable) {
        throw new Error("This property is currently not available for rent!");
    }

    const existingPendingRequest = await prisma.booking.findFirst({
        where: {
            tenantId,
            propertyId,
            status: BookingStatus.PENDING
        }
    });

    if (existingPendingRequest) {
        throw new Error("You already have a pending rental request submitted for this property!");
    }

    const checkIn = new Date(startDate);
    const checkOut = new Date(endDate);
    
    const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    
    if (totalDays <= 0) {
        throw new Error("End date must be after start date!");
    }

    const autoTotalPrice = totalDays * property.pricePerDay;
    const result = await prisma.booking.create({
        data: {
            tenantId,
            propertyId,
            startDate: checkIn,
            endDate: checkOut,
            totalPrice: autoTotalPrice,
            status: BookingStatus.PENDING
        }
    });

    return result;
};

const getMyBookings = async (userId: string, role: string) => {
    const result = await prisma.booking.findMany({
        where: {
            ...(role === "TENANT" && { tenantId: userId }),
            ...(role === "LANDLORD" && { property: { landlordId: userId } })
        },
        include: {
            property: true,
            tenant: {
                omit: { password: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return result;
};

const getBookingById = async (bookingId: string) => {
    const result = await prisma.booking.findUniqueOrThrow({
        where: { id: bookingId },
        include: {
            property: true,
            tenant: {
                omit: { password: true }
            }
        }
    });

    return result;
};

const handleBookingStatusUpdate = async (bookingId: string, landlordId: string, status: BookingStatus) => {
    return await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUniqueOrThrow({
            where: { id: bookingId },
            include: { property: true }
        });
        if (booking.property.landlordId !== landlordId) {
            throw new Error("You do not own this property to manage requests!");
        }

        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: { status }
        });

        if (status === BookingStatus.CONFIRMED) {
            await tx.property.update({
                where: { id: booking.propertyId },
                data: { isAvailable: false }
            });
            await tx.booking.updateMany({
                where: {
                    propertyId: booking.propertyId,
                    status: BookingStatus.PENDING,
                    id: { not: bookingId }
                },
                data: { status: BookingStatus.CANCELLED }
            });
        }

        return updatedBooking;
    });
};

export const BookingService = {
    createBookingRequest,
    getMyBookings,
    getBookingById,
    handleBookingStatusUpdate
};
