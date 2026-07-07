import { ActiveStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

// ১. সব ইউজার গেট করা
const getAllUsers = async () => {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

// ২. ইউজার স্ট্যাটাস আপডেট (BAN/ACTIVATE)
const updateUserStatus = async (id: string, status: ActiveStatus) => {
    return await prisma.user.update({
        where: { id },
        data: { activeStatus: status }
    });
};

// ৩. সব প্রপার্টি গেট করা
const getAllProperties = async () => {
    return await prisma.property.findMany({
        include: {
            landlord: { select: { name: true, email: true } },
            category: true
        }
    });
};

// ৪. সব রেন্টাল রিকোয়েস্ট (Bookings) গেট করা
const getAllRentals = async () => {
    return await prisma.booking.findMany({
        include: {
            tenant: { select: { name: true, email: true } },
            property: { select: { title: true, pricePerDay: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const AdminService = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentals
};
