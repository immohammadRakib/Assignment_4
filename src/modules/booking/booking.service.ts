import { BookingStatus } from "../../../generated/prisma/browser";
import { prisma } from "../../lib/prisma"

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
            totalPrice,
            status: BookingStatus.PENDING
        }
    });
    return result;
}

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

        // Booking approve hole property state dynamic template handle kora loop:
        if ( status === BookingStatus.CONFIRMED ) {
            await tx.property.update({
                where: { id: booking.propertyId },
                data: { isAvailable: false }
            });
        }

        return updatedBooking;
    });
}

export const BookingService = {
    createBookingRequest,
    handleBookingStatusUpdate
};
