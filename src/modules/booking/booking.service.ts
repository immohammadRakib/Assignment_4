import { BookingStatus } from "../../../generated/prisma/browser";
import { prisma } from "../../lib/prisma";

const createBookingRequest = async (payload: any, tenantId: string) => {
    const { propertyId, startDate, endDate, totalPrice } = payload;

    // Check mapping if property is available
    const property = await prisma.property.findUniqueOrThrow({
        where: { id: propertyId }
    });

    if (!property.isAvailable) {
        throw new Error("This property is currently not available for rent!");
    }

    const result = await prisma.booking.create({
        data: {
            tenantId,
            propertyId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalPrice: Number(totalPrice),
            status: BookingStatus.PENDING
        }
    });

    return result;
};

const getMyBookings = async (userId: string, role: string) => {
    // Tenant nizer requests dekhbe, Landlord tar flat er requests dekhbe
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

        // Authorization validation: land lord identity verify check
        if (booking.property.landlordId !== landlordId) {
            throw new Error("You do not own this property to manage requests!");
        }

        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: { status }
        });

        // Booking approve hole property state check context loop automation toggler:
        if (status === BookingStatus.CONFIRMED) {
            await tx.property.update({
                where: { id: booking.propertyId },
                data: { isAvailable: false }
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
