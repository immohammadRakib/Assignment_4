import { ActiveStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";






// Get All User 
const getAllUsers = async () => {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

// User status Active/Blocked
const updateUserStatus = async (id: string, status: ActiveStatus) => {
    return await prisma.user.update({
        where: { id },
        data: { activeStatus: status }
    });
};

// Get All Property
const getAllProperties = async () => {
    return await prisma.property.findMany({
        include: {
            landlord: { select: { name: true, email: true } },
            category: true
        }
    });
};

// All Rental Request
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
