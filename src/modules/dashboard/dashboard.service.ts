import { prisma } from "../../lib/prisma"





// Admin Stats For Dashboard
const getAdminDashboardStats = async () => {
    const [
        totalTenants,
        totalLandlords,
        totalBannedUsers,
        totalProperties,
        totalCategories,
        totalRentalRequests,
        totalConfirmedBookings
    ] = await Promise.all([

        prisma.user.count({ where: { role: "TENANT" } }),
        prisma.user.count({ where: { role: "LANDLORD" } }),
        prisma.user.count({ where: { activeStatus: "BLOCKED" } }), 
        
        prisma.property.count(),
        prisma.category.count(),

        prisma.booking.count(),
        prisma.booking.count({ where: { status: "CONFIRMED" } })
    ]);

    return {
        totalTenants,
        totalLandlords,
        totalBannedUsers,
        totalProperties,
        totalCategories,
        totalRentalRequests,
        totalConfirmedBookings
    };
};




// Landlord Stats For Dashboard
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
        prisma.property.count({ where: { landlordId, isAvailable: true } }),
        prisma.booking.count({ where: { property: { landlordId } } }),

        prisma.booking.count({ where: { property: { landlordId }, status: "PENDING" } }),
        prisma.booking.count({ where: { property: { landlordId }, status: "CONFIRMED" } }),
 
        prisma.review.count({ where: { property: { landlordId } } }),
        
        prisma.property.aggregate({
            where: { landlordId },
            _sum: { views: true }
        }),
        
        prisma.booking.aggregate({
            where: {
                property: { landlordId },
                    status: "PAID" 
            },
            _sum: {
                totalPrice: true 
            }
        })

    ]);

    return {
        myTotalProperties,
        myAvailableProperties,
        myTotalBookings,
        myPendingRequests,
        myConfirmedBookings,
        myTotalReviews,
        myPropertyViews: myPropertyViewsAggregate._sum.views || 0 ,
        myTotalEarningsAggregate
    };
};



export const DashboardService = {
    getAdminDashboardStats,
    getLandlordDashboardStats
}