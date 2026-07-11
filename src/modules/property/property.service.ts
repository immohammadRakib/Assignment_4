import { PropertyStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  ICreatePropertyPayload,
  IUpdatePropertyPayload,
} from "./property.interface";
import { calculatePagination } from "../../utils/pagination"



// Create Property
const createProperty = async (
  payload: ICreatePropertyPayload,
  userId: string,
) => {
  const imagesData =
    typeof payload.images === "string" ? [payload.images] : payload.images;

  const result = await prisma.property.create({
    data: {
      ...payload,
      images: imagesData,
      landlordId: userId,
    },
  });

  return result;
};




// Get All Properties
// const getAllProperties = async (query: Record<string, any>) => {
//   const {
//     role,
//     landlordId,
//     search,
//     location,
//     categoryId,
//     minPrice,
//     maxPrice,
//     sortBy,
//   } = query;

//   const { page = 1, limit = 5 } = query;
//   const skip = (Number(page) - 1) * Number(limit);

//   let roleBasedCondition: any = {};

//   if (role === "ADMIN") {
//     roleBasedCondition = {};
//   } else if (role === "LANDLORD" && landlordId ) {
//     roleBasedCondition = { landlordId };
//   } else {
//     roleBasedCondition = {
//       isDeleted: false,
//       status: PropertyStatus.APPROVED,
//       isAvailable: true,
//       landlord: {
//         is: { activeStatus: "ACTIVE" },
//       },
//     };
//   }

//   const filterCondition: any = {};

//   if (location) {
//     filterCondition.location = { contains: location, mode: "insensitive" };
//   }

//   if (categoryId) {
//     filterCondition.categoryId = categoryId;
//   }

//   if (minPrice !== undefined || maxPrice !== undefined) {
//     const priceFilter: any = {};
//     if (minPrice !== undefined && minPrice !== "")
//       priceFilter.gte = Number(minPrice);
//     if (maxPrice !== undefined && maxPrice !== "")
//       priceFilter.lte = Number(maxPrice);
//     filterCondition.pricePerDay = priceFilter;
//   }

//   if (search) {
//     filterCondition.OR = [
//       { title: { contains: search, mode: "insensitive" } },
//       { city: { contains: search, mode: "insensitive" } },
//       { description: { contains: search, mode: "insensitive" } },
//     ];
//   }

//   const finalWhereCondition = { ...roleBasedCondition, ...filterCondition };

//   const orderByCondition =
//     sortBy === "newest"
//       ? [{ createdAt: "desc" }]
//       : [{ views: "desc" }, { reviews: { _count: "desc" } }];

//   const [total, result] = await prisma.$transaction([
//     prisma.property.count({ where: finalWhereCondition }),
//     prisma.property.findMany({
//       where: finalWhereCondition,
//       orderBy: orderByCondition as any,
//       skip,
//       take: Number(limit),
//       include: {
//         landlord: {
//           select: { id: true, name: true, activeStatus: true },
//         },
//         category: true,
//         _count: {
//           select: { reviews: true },
//         },
//       },
//     }),
//   ]);

  
//    return {
//         meta: { page: Number(page), limit: Number(limit), total, totalPage: Math.ceil(total / Number(limit)) },
//         data: result
//     };
// };




const getAllProperties = async (query: Record<string, any>) => {
  const {
    role,
    landlordId,
    search,
    location,
    categoryId,
    minPrice,
    maxPrice,
    sortBy,
  } = query;

  const { page, limit, skip } = calculatePagination(query);

  const andConditions: any[] = [];

  if (role === "LANDLORD" && landlordId) {
    andConditions.push({ landlordId });
  } else if (role !== "ADMIN") {
    andConditions.push({
      isDeleted: false,
      status: PropertyStatus.APPROVED,
      isAvailable: true,
      landlord: {
        activeStatus: "ACTIVE",
      },
    });
  }

  if (location) {
    andConditions.push({
      location: { contains: location, mode: "insensitive" },
    });
  }

  if (categoryId) {
    andConditions.push({ categoryId });
  }

  if (minPrice !== undefined && minPrice !== "") {
    andConditions.push({ pricePerDay: { gte: Number(minPrice) } });
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    andConditions.push({ pricePerDay: { lte: Number(maxPrice) } });
  }

  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};

  const orderByCondition =
    sortBy === "newest"
      ? [{ createdAt: "desc" }]
      : [{ views: "desc" }, { reviews: { _count: "desc" } }];

  const [total, result] = await Promise.all([
    prisma.property.count({ where: whereCondition }),
    prisma.property.findMany({
      where: whereCondition,
      orderBy: orderByCondition as any,
      skip,               
      take: limit,
      include: {
        landlord: {
          select: { id: true, name: true, activeStatus: true },
        },
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
    }),
  ]);

  const totalPage = Math.ceil(total / limit); 

  return {
    meta: { page, limit, total, totalPage },
    data: result,
  };
};






// Get Property By Id
const getPropertyById = async (propertyId: string, role?: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.property.update({
      where: { id: propertyId },
      data: { views: { increment: 1 } },
    });

    const property = await tx.property.findUniqueOrThrow({
      where: { id: propertyId },
      include: {
        landlord: {
          select: { id: true, name: true, email: true },
        },
        category: true,
        reviews: {
          orderBy: [
            { rating: "desc" },
            {
              _relevance: {
                fields: ["comment"],
                search:
                  "excellent | amazing | fantastic | good | nice | enjoyable | prefer",
                sort: "desc",
              },
            },
          ],
          include: {
            tenant: { select: { 
                name: true,
                profile: {
                  select: {
                    profileImage: true 
                  }
                },
              } },
          },
        },
        bookings: {
          where: 
            role === "ADMIN" || role === "LANDLORD"
              ? {} 
              : { status: { in: ["CONFIRMED", "PAID"] }, endDate: { gte: new Date() } }, 
          select: {
            startDate: true, 
            endDate: true,
            status: true
          },    
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    });

    return property;
  });
};




// Update Property
const updateProperty = async (
  propertyId: string,
  payload: IUpdatePropertyPayload,
  ownerId: string,
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });

  if (property.landlordId !== ownerId) {
    throw new Error("You are not the owner of this property!");
  }
  
  const { landlordId, views, id, createdAt, ...safePayload } = payload as any;

  const result = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data: safePayload,
    include: {
      landlord: {
        omit: {
          password: true,
        },
      },
      bookings: true,
    },
  });

  return result;
};




// Update Availability Status by Landlord
const updateAvailability = async (
  id: string,
  availabilityStatus: boolean,
  landlordId: string,
) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if ( !property ) {
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
const changePropertyStatusByAdmin = async (
  propertyId: string,
  status: PropertyStatus,
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: { id: propertyId },
  });

  const result = await prisma.property.update({
    where: { id: propertyId },
    data: {
      status: status,
    },
  });

  return result;
};




// Delete Property
const deleteProperty = async (propertyId: string, ownerId: string) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });

  if (property.landlordId !== ownerId) {
    throw new Error("You are not the owner of this property!");
  }

  await prisma.property.delete({
    where: {
      id: propertyId,
    },
  });
};



// Get Own Properties
const getMyProperties = async (landlordId: string) => {
  const result = await prisma.property.findMany({
    where: {
      landlordId: landlordId,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      bookings: true,
      landlord: {
        omit: {
          password: true,
        },
      },

      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  return result;
};




export const PropertyService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
  updateAvailability,
  changePropertyStatusByAdmin,
};
