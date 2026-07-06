import { BookingStatus, PropertyStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"
import { ICreatePropertyPayload, IUpdatePropertyPayload } from "./property.interface"

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

const getAllProperties = async () => {
    const properties = await prisma.property.findMany(
        {
            include : {
                landlord : {
                    omit : {
                        password : true
                    }
                },
                bookings : true
            }
        }
    );

    return properties
}

const getPropertyById = async (propertyId : string) => {

    // await prisma.property.update({
    //     where : {
    //         id : propertyId,
    //     },
    //     data : {
    //         views : {
    //             increment : 1
    //         },
    //     }
    // })

    // throw new Error("Fake Error")

    // const property = await prisma.property.findUniqueOrThrow({
    //     where : {
    //         id : propertyId
    //     },

    //     include : {
    //         landlord : {
    //             omit : {
    //                 password : true
    //             }
    //         },

    //         comments : {
    //             where : {
    //                 status : CommentStatus.APPROVED
    //             },

    //             orderBy : {
    //                 createdAt : "desc"
    //             }
    //         },

    //         _count : {
    //             select : {
    //                 comments : true
    //             }
    //         }
    //     }
    // })

    // return property

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
            // throw new Error("fake error")
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

const getPropertiesStats = async () => {
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            // const totalProperties = await tx.property.count();

            // const totalPublishedProperties = await tx.property.count({
            //     where : {
            //         status : PostStatus.PUBLISHED
            //     }
            // })
            // const totalDraftPosts = await tx.post.count({
            //     where : {
            //         status : PostStatus.DRAFT
            //     }
            // })
            // const totalArchivedPosts = await tx.post.count({
            //     where : {
            //         status : PostStatus.ARCHIVED
            //     }
            // })

            // const totalComments = await tx.comment.count();

            // const totalApprovedComments = await tx.comment.count({
            //     where : {
            //         status : CommentStatus.APPROVED
            //     }
            // });
            // const totalRejectedComments = await tx.comment.count({
            //     where : {
            //         status : CommentStatus.REJECT
            //     }
            // });

            // //Not a good approach
            // // const allPosts = await tx.post.findMany();

            // // let totalPostViews = 0;

            // // allPosts.forEach((post)=>{
            // //     totalPostViews = totalPostViews + post.views
            // // })

            // //Good Approach
            // const totalPostViewsAggregate = await tx.post.aggregate({
            //     _sum : {
            //         views : true
            //     }
            // })

            // const totalPostViews = totalPostViewsAggregate._sum.views\

            // return {
            //     totalPosts,
            //     totalPublishedPosts,
            //     totalDraftPosts,
            //     totalArchivedPosts,
            //     totalComments,
            //     totalApprovedComments,
            //     totalRejectedComments,
            //     totalPostViews
            // }


            const [
                totalProperties,
                totalPublishedProperties,
                totalDraftProperties,
                totalArchivedProperties,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPropertyViewsAggregate
            ] = await Promise.all([
                await tx.property.count(),
                await tx.property.count({
                    where: {
                        status: PropertyStatus.AVAILABLE
                    }
                }),
                await tx.property.count({
                    where: {
                        status: PropertyStatus.PENDING
                    }
                }),
                await tx.property.count({
                    where: {
                        status: PropertyStatus.RENTED
                    }
                }),
                await tx.booking.count(),
                await tx.booking.count({
                    where: {
                        status: BookingStatus.CONFIRMED
                    }
                }),
                await tx.booking.count({
                    where: {
                        status: BookingStatus.CANCELLED
                    }
                }),
                await tx.property.aggregate({
                    _sum: {
                        views: true
                    }
                })
            ]);


            return {
                totalProperties,
                totalPublishedProperties,
                totalDraftProperties,
                totalArchivedProperties,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPropertyViews : totalPropertyViewsAggregate._sum.views
            }
        }
    );

    return transactionResult
}

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

export const PropertyService = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getPropertiesStats,
    getMyProperties
}