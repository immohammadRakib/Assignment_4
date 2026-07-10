import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";




// Create Booking Request
const createBookingRequest = async (payload: any, tenantId: string) => {
  const { propertyId, startDate, endDate } = payload;

  const property = await prisma.property.findUniqueOrThrow({
    where: { id: propertyId },
  });

  if (!property.isAvailable) {
    throw new Error("This property is currently not available for rent!");
  }

  const existingPendingRequest = await prisma.booking.findFirst({
    where: {
      tenantId,
      propertyId,
      status: BookingStatus.PENDING,
    },
  });

  if (existingPendingRequest) {
    throw new Error("You already have a pending rental request for this property!");
  }

  const checkIn = new Date(startDate);
  checkIn.setHours(0, 0, 0, 0);
  
  const checkOut = new Date(endDate);
  checkOut.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    throw new Error("Check-in date cannot be in the past!");
  }
  if (checkOut <= checkIn) {
    throw new Error("End date must be after start date!");
  }

  const isConflict = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: { in: ["CONFIRMED", "PAID"] },
      OR: [
        {
          AND: [
            { startDate: { lte: checkIn } }, 
            { endDate: { gte: checkIn } }
          ]
        },
        {
          AND: [
            { startDate: { lte: checkOut } }, 
            { endDate: { gte: checkOut } }
          ]
        },
        {
          AND: [
            { startDate: { gte: checkIn } }, 
            { endDate: { lte: checkOut } }
          ]
        }
      ]
    }
  });

  if (isConflict) {
    throw new Error("This property is already booked for the selected dates!");
  }

  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  let totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (totalDays === 0) totalDays = 1; 

  const autoTotalPrice = totalDays * property.pricePerDay;

  const result = await prisma.booking.create({
    data: {
      tenantId,
      propertyId,
      startDate: checkIn,
      endDate: checkOut,
      totalPrice: autoTotalPrice,
      status: BookingStatus.PENDING,
    },
  });

  return result;
};




// Get My Bookings (For Tenants and Landlords)
const getMyBookings = async (userId: string, role: string) => {
  const result = await prisma.booking.findMany({
    where: {
      ...(role === "TENANT" && { tenantId: userId }),
      ...(role === "LANDLORD" && { property: { landlordId: userId } }),
    },
    include: {
      property: true,
      tenant: { omit: { password: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};



// Get All Booking Hisoty for Admin
const getAllBookingsForAdmin = async () => {
  const result = await prisma.booking.findMany({
    include: {
      property: true,
      tenant: { omit: { password: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};



// Get Booking By Id
const getBookingById = async (bookingId: string) => {
  const result = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      property: true,
      tenant: { omit: { password: true } },
    },
  });

  return result;
};




// Handle Booking Status Update 
const handleBookingStatusUpdate = async (
  bookingId: string,
  landlordId: string,
  status: BookingStatus,
) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { property: true },
    });
    if (booking.property.landlordId !== landlordId) {
      throw new Error("You do not own this property to manage requests!");
    }

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (status === BookingStatus.PAID) {
      await tx.booking.updateMany({
        where: {
          propertyId: booking.propertyId,
          status: BookingStatus.PENDING,
          id: { not: bookingId },
          AND: [
            { startDate: { lt: booking.endDate } },
            { endDate: { gt: booking.startDate } }
          ]
        },
        data: { status: BookingStatus.CANCELLED },
      });
    }

    return updatedBooking;
  });
};


// Cancel booking by Tenant
const cancelBookingByTenant = async (bookingId: string, tenantId: string) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
    });

    if (booking.tenantId !== tenantId) {
      throw new Error("You are not authorized to cancel this booking!");
    }

    if (booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PAID) {
      throw new Error("Cannot cancel. This booking is already confirmed or paid. Please contact the landlord.");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error("This booking is already cancelled!");
    }

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    return updatedBooking;
  });
};



export const BookingService = {
  createBookingRequest,
  getMyBookings,
  getAllBookingsForAdmin,
  getBookingById,
  handleBookingStatusUpdate,
  cancelBookingByTenant,
};
