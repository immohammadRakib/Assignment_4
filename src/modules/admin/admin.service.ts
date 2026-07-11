import { ActiveStatus, BookingStatus, PropertyStatus } from "../../../generated/prisma/client";
import { calculatePagination } from "../../utils/pagination"
import { prisma } from "../../lib/prisma";



// Get All User with Pagination 
// const getAllUsers = async (query: Record<string, any>) => {
//     const { page = 1, limit = 10 } = query;
//     const skip = (Number(page) - 1) * Number(limit);

//     const [total, result] = await prisma.$transaction([
//         prisma.user.count(),
//         prisma.user.findMany({
//             omit: { password: true },
//             include: { profile: true },
//             skip,
//             take: Number(limit),
//             orderBy: { createdAt: 'desc' }
//         })
//     ]);

//     return {
//         meta: { page: Number(page), limit: Number(limit), total, totalPage: Math.ceil(total / Number(limit)) },
//         data: result
//     };
// };

const getAllUsers = async (query: Record<string, any>) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query);

    const [total, result] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.findMany({
            omit: { password: true },
            include: { profile: true },
            skip,               
            take: limit,       
            orderBy: { 
                [sortBy]: sortOrder 
            }
        })
    ]);

    return {
        meta: { 
            page, 
            limit, 
            total, 
            totalPage: Math.ceil(total / limit) 
        },
        data: result
    };
};




// User status Active/Blocked
const updateUserStatus = async (id: string, status: ActiveStatus) => {
    return await prisma.user.update({
        where: { id },
        data: { activeStatus: status },
        omit: { password: true }
    });
};



// Get All Properties
const getAllProperties = async (query: Record<string, any>) => {
    const { status, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const [total, result] = await prisma.$transaction([
        prisma.property.count({ where: status ? { status: status as PropertyStatus } : {} }),
        prisma.property.findMany({
            where: status ? { status: status as PropertyStatus } : {},
            include: {
                landlord: { select: { id: true, name: true, email: true, activeStatus: true } },
                category: true,
                _count: { select: { reviews: true, bookings: true } }
            },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        })
    ]);

    return {
        meta: { page: Number(page), limit: Number(limit), total, totalPage: Math.ceil(total / Number(limit)) },
        data: result
    };
};




// All Rental Request with Pagination & Status Filter
const getAllRentals = async (query: Record<string, any>) => {
    const { status, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const [total, result] = await prisma.$transaction([
        prisma.booking.count({ where: status ? { status: status as BookingStatus } : {} }),
        prisma.booking.findMany({
            where: status ? { status: status as BookingStatus } : {},
            include: {
                tenant: { select: { id: true, name: true, email: true } },
                property: { 
                    select: { 
                        id: true, 
                        title: true, 
                        pricePerDay: true, 
                        landlordId: true,
                        city: true 
                    } 
                },
                payment: true 
            },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        })
    ]);

    return {
        meta: { page: Number(page), limit: Number(limit), total, totalPage: Math.ceil(total / Number(limit)) },
        data: result
    };
};




export const AdminService = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentals
};
