import { prisma } from "../../lib/prisma"

// Interface payload gulo local file theke import korte paren
const createProperty = async (payload: any, landlordId: string) => {
    const result = await prisma.property.create({
        data: {
            ...payload,
            landlordId: landlordId
        }
    });
    return result;
}

const getAllProperties = async (filters: any) => {
    const { city, type, maxPrice, search } = filters;
    
    const result = await prisma.property.findMany({
        where: {
            isAvailable: true,
            ...(city && { city: { equals: city, mode: 'insensitive' } }),
            ...(type && { type: { equals: type, mode: 'insensitive' } }),
            ...(maxPrice && { pricePerDay: { lte: Number(maxPrice) } }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { location: { contains: search, mode: 'insensitive' } }
                ]
            })
        },
        include: {
            landlord: {
                omit: { password: true } // Securely omit password field
            },
            reviews: true
        },
        orderBy: { createdAt: 'desc' }
    });
    return result;
}

const getPropertyById = async (propertyId: string) => {
    const result = await prisma.property.findUniqueOrThrow({
        where: { id: propertyId },
        include: {
            landlord: { omit: { password: true } },
            reviews: {
                include: {
                    tenant: { omit: { password: true } }
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });
    return result;
}

const updateProperty = async (propertyId: string, payload: any, landlordId: string, isAdmin: boolean) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: { id: propertyId }
    });

    if (!isAdmin && property.landlordId !== landlordId) {
        throw new Error("You are not the owner of this property!");
    }

    const result = await prisma.property.update({
        where: { id: propertyId },
        data: payload
    });
    return result;
}

const deleteProperty = async (propertyId: string, landlordId: string, isAdmin: boolean) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: { id: propertyId }
    });

    if (!isAdmin && property.landlordId !== landlordId) {
        throw new Error("You are not authorized to delete this property!");
    }

    await prisma.property.delete({
        where: { id: propertyId }
    });
}

export const PropertyService = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
};
