import { BookingStatus, PropertyStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"
import { ICreatePropertyPayload, IUpdatePropertyPayload } from "./property.interface"




// Create Property
const createProperty = async (payload : ICreatePropertyPayload, userId : string) => {
    const imagesData = typeof payload.images === 'string' 
        ? [payload.images] 
        : payload.images;

    const result = await prisma.property.create({
        data : {
            ...payload,
            images: imagesData,
            landlordId : userId
        }
    })

    return result
}



// Get All Properties
const getAllProperties = async ( query: Record<string, any> ) => {
    const { role, landlordId } = query;

    let whereCondition: any = {
        status: "APPROVED",
        isAvailable: true
    };

    if (role === "ADMIN") {
        whereCondition = {}; 
    }

    if (role === "LANDLORD" && landlordId) {
        whereCondition = {
            landlordId: landlordId 
        };
    }

    const properties = await prisma.property.findMany({
        where: whereCondition, 
        include: {
            landlord: {
                omit: {
                    password: true
                }
            },
            bookings: true
        }
    });

    return properties;
};




// Get Property By Id 
const getPropertyById = async (propertyId : string) => {
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            await tx.property.update({
                where: {
                    id: propertyId,
                },
                data: {
                    views: {
                        increment: 1
                    },
                }
            });

            const property = await tx.property.findUniqueOrThrow({
                where: {
                    id: propertyId
                },

                include: {
                    landlord: {
                        omit: {
                            password: true
                        }
                    },

                    bookings: {
                        where: {
                            status: BookingStatus.CONFIRMED
                        },

                        orderBy: {
                            createdAt: "desc"
                        }
                    },

                    _count: {
                        select: {
                            bookings: true
                        }
                    }
                }
            });
            return property
        }
    );

    return transactionResult

}



// Update Property
const updateProperty = async (propertyId : string, payload : IUpdatePropertyPayload, ownerId : string, isAdmin : boolean) => {
    const property = await prisma.property.findUniqueOrThrow({
        where : {
            id : propertyId 
        }
    })

    if(!isAdmin && property.landlordId !== ownerId ){
        throw new Error("You are not the owner of this property!")
    }

    const result = await prisma.property.update({
        where : {
            id : propertyId
        },
        data : payload,
        include: {
            landlord: {
                omit: {
                    password: true
                }
            },
            bookings: true
        }
    })

    return result;
}



// Update Availability Status
const updateAvailability = async (id: string, availabilityStatus: boolean) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    throw new Error("Property not found!");
  }

  const result = await prisma.property.update({
    where: { id },
    data: {
      isAvailable: availabilityStatus, 
    },
  });

  return result;
};




// Delete Property
const deleteProperty = async (propertyId: string, ownerId: string, isAdmin: boolean) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId
        }
    });

    if (!isAdmin && property.landlordId !== ownerId) {
        throw new Error("You are not the owner of this property!")
    }

    await prisma.property.delete({
        where : {
            id : propertyId 
        }
    })

}




// Get Own Properties
const getMyProperties = async (landlordId : string) => {

    const result = await prisma.property.findMany({
        where : {
            landlordId : landlordId
        },

        orderBy : {
            createdAt : "desc"
        },

        include : {
            bookings : true,
            author : {
                omit : {
                    password : true
                }
            },

            _count : {
                select : {
                    bookings : true
                }
            }
        }
    });

    return result;

}




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
        prisma.user.count({ where: { activeStatus: "ACTIVE" } }), 
        
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





export const PropertyService = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getMyProperties,
    updateAvailability,
    getAdminDashboardStats,
    getLandlordDashboardStats
}