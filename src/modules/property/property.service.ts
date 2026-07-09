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
const updateProperty = async (propertyId : string, payload : IUpdatePropertyPayload, ownerId : string ) => {
    const property = await prisma.property.findUniqueOrThrow({
        where : {
            id : propertyId 
        }
    })

    if( property.landlordId !== ownerId ){
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



// Update Availability Status by Landlord
const updateAvailability = async (id: string, availabilityStatus: boolean, landlordId: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    throw new Error("Property not found!");
  }
  if (property.landlordId !== landlordId) {
    throw new Error("You do not own this property to change its availability!");
  }

  const result = await prisma.property.update({
    where: { id },
    data: {
      isAvailable: availabilityStatus, 
    },
  });

  return result;
};





//Update Property Status by Admin
const changePropertyStatusByAdmin = async (propertyId: string, status: PropertyStatus) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: { id: propertyId }
    });

    const result = await prisma.property.update({
        where: { id: propertyId },
        data: {
            status: status 
        }
    });

    return result;
};





// Delete Property
const deleteProperty = async (propertyId: string, ownerId: string ) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: propertyId
        }
    });

    if ( property.landlordId !== ownerId) {
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
            landlord : {
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






export const PropertyService = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getMyProperties,
    updateAvailability,
    changePropertyStatusByAdmin,
}