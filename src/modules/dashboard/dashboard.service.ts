import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

// ১. Admin Stats
const getAdminDashboardStats = async () => {
    const [
        totalTenants,
        totalLandlords,
        totalBannedUsers,
        totalProperties,
        totalCategories,
        totalRentalRequests,
        totalConfirmedBookings,
        totalPlatformEarnings
    ] = await Promise.all([
        prisma.user.count({ where: { role: "TENANT" } }),
        prisma.user.count({ where: { role: "LANDLORD" } }),
        prisma.user.count({ where: { activeStatus: "BLOCKED" } }),
        
        prisma.property.count(),
        prisma.category.count(),

        prisma.booking.count(),
        prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
        
        prisma.booking.aggregate({
            where: { status: BookingStatus.PAID },
            _sum: { totalPrice: true }
        })
    ]);

    return {
        totalTenants,
        totalLandlords,
        totalBannedUsers,
        totalProperties,
        totalCategories,
        totalRentalRequests,
        totalConfirmedBookings,
        totalPlatformEarnings: Number(totalPlatformEarnings._sum.totalPrice) || 0
    };
};

// ২. Landlord Stats
const getLandlordDashboardStats = async (landlordId: string) => {
    const [
        myTotalProperties,
        myAvailableProperties,
        myTotalBookings,
        myPendingRequests,
        myConfirmedBookings,
        myTotalReviews,
        myPropertyViewsAggregate,
        myTotalEarningsAggregate
    ] = await Promise.all([
        prisma.property.count({ where: { landlordId } }),
        prisma.property.count({ where: { landlordId, isAvailable: true, status: "APPROVED" } }),
        prisma.booking.count({ where: { landlordId } }), 

        prisma.booking.count({ where: { landlordId, status: BookingStatus.PENDING } }),
        prisma.booking.count({ where: { landlordId, status: BookingStatus.CONFIRMED } }),
 
        prisma.review.count({ where: { property: { landlordId } } }),
        
        prisma.property.aggregate({
            where: { landlordId },
            _sum: { views: true }
        }),
        
        prisma.booking.aggregate({
            where: { landlordId, status: BookingStatus.PAID },
            _sum: { totalPrice: true }
        })
    ]);

    return {
        myTotalProperties,
        myAvailableProperties,
        myTotalBookings,
        myPendingRequests,
        myConfirmedBookings,
        myTotalReviews,
        myPropertyViews: myPropertyViewsAggregate._sum.views || 0,
        myTotalEarnings: Number(myTotalEarningsAggregate._sum.totalPrice) || 0 
    };
};

// ৩. Tenant Stats
const getTenantDashboardStats = async (tenantId: string) => {
    const [
        myTotalBookings,
        myPendingBookings,
        myConfirmedBookings,
        myTotalReviewsWritten,
        myTotalSpentAggregate,
        recentPayments
    ] = await Promise.all([
        prisma.booking.count({ where: { tenantId } }),
        prisma.booking.count({ where: { tenantId, status: BookingStatus.PENDING } }),
        prisma.booking.count({ where: { tenantId, status: BookingStatus.CONFIRMED } }),
        prisma.review.count({ where: { tenantId } }),

        prisma.booking.aggregate({
            where: { tenantId, status: BookingStatus.PAID },
            _sum: { totalPrice: true }
        }),

        prisma.booking.findMany({
            where: { tenantId, status: BookingStatus.PAID },
            select: {
                id: true,
                totalPrice: true,
                createdAt: true,
                property: { select: { title: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 5 
        })
    ]);

    return {
        myTotalBookings,
        myPendingBookings,
        myConfirmedBookings,
        myTotalReviewsWritten,
        myTotalSpent: Number(myTotalSpentAggregate._sum.totalPrice) || 0,
        recentPayments
    };
};

export const DashboardService = {
    getAdminDashboardStats,
    getLandlordDashboardStats,
    getTenantDashboardStats
};
