import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createBookingRequest = async (payload: any, tenantId: string) => {
    const { propertyId, startDate, endDate } = payload;

    // ১. প্রোপার্টি ডাটাবেজে আছে কি না তা খুঁজে বের করা ✅ (বাগ ফিক্সড)
    const property = await prisma.property.findUniqueOrThrow({
        where: { id: propertyId }
    });

    // ২. প্রোপার্টিটি ভাড়া দেওয়ার জন্য খালি আছে কি না চেক করা
    if (!property.isAvailable) {
        throw new Error("This property is currently not available for rent!");
    }

    // ৩. 🧠 ডুপ্লিকেট বুকিং প্রোটেকশন চেক (নতুন যুক্ত করা হয়েছে)
    // একই টেন্যান্ট একই ফ্ল্যাটে অলরেডি কোনো পেন্ডিং রিকোয়েস্ট রেখে দিলে নতুন রিকোয়েস্ট ব্লক হবে
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

    // ৪. তারিখের ব্যবধান বা দিনের সংখ্যা হিসাব করা
    const checkIn = new Date(startDate);
    const checkOut = new Date(endDate);
    
    const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    
    if (totalDays <= 0) {
        throw new Error("End date must be after start date!");
    }

    // ৫. ব্যাকএন্ড থেকে স্বয়ংক্রিয়ভাবে মোট প্রাইস ক্যালকুলেট করা
    const autoTotalPrice = totalDays * property.pricePerDay;

    // ৬. ডাটাবেজে নতুন বুকিং তৈরি করা
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
    // Tenant নিজের হিস্টোরি দেখবে, Landlord তার ফ্ল্যাটের রিকোয়েস্টগুলো দেখবে
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

        // Authorization validation: landlord identity match verification
        if (booking.property.landlordId !== landlordId) {
            throw new Error("You do not own this property to manage requests!");
        }

        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: { status }
        });

        // Booking approve হলে প্রোপার্টির এভেইলেবিলিটি বন্ধ করে দেওয়া
        if (status === BookingStatus.CONFIRMED) {
            await tx.property.update({
                where: { id: booking.propertyId },
                data: { isAvailable: false }
            });
            
            // স্পেশাল অপটিমাইজেশন: ১টা রিকোয়েস্ট CONFIRMED হলে ঐ ডেটের বাকি সব PENDING রিকোয়েস্ট অটো ক্যানসেল করে দেওয়া
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
