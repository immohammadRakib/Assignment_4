import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PropertyService } from "./property.service";




// Create Property 
const createProperty = catchAsync(async ( req : Request, res : Response ) => {
    const id = req.user?.id

    const payload = req.body;

    const result = await PropertyService.createProperty( payload, id as string );


    sendResponse(res, {
        success : true,
        statusCode : httpStatus.CREATED,
        message : "Property Created SuccessFully",
        data : result
    })
})



// Get All Properties
const getAllProperties = catchAsync(async (req: Request, res: Response) => {
    const { 
        location, 
        categoryId, 
        minPrice, 
        maxPrice, 
        sortBy, 
        search 
    } = req.query;

    const query = {
        location: location as string,
        categoryId: categoryId as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as string,
        search: search as string,
        role: req.user?.role,       
        landlordId: req.user?.id   
    };

    const result = await PropertyService.getAllProperties(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result
    });
});



// Get Properties By Id
const getPropertyById = catchAsync(async ( req : Request, res : Response ) => {
    const propertyId = req.params.propertyId;

    if(!propertyId){
        throw new Error("Property Id Required In Params")
    }

    const result = await PropertyService.getPropertyById( propertyId as string );

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Property retrieved successfully",
        data : result
    })
})



// Update Property By Id
const updateProperty = catchAsync(async ( req : Request, res : Response ) => {
    const landlordId = req.user?.id
    if (!landlordId) {
    throw new Error("Unauthorized access. Landlord ID missing.");
}

    const propertyId = req.params.propertyId;

    if (!propertyId) {
        throw new Error("Property Id Required In Params")
    }

    const payload = req.body;

    const result = await PropertyService.updateProperty( propertyId as string, payload, landlordId as string );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: result
    })
})






// Change Property Status By Admin
const changePropertyStatus = catchAsync(async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const { status } = req.body; 

    if (!status) {
        throw new Error("Property status is required in body!");
    }

    const result = await PropertyService.changePropertyStatusByAdmin(
        propertyId as string, 
        status
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Property status updated to ${status} successfully`,
        data: result
    });
});





// Toggle Property Availability By Landlord
const toggleAvailability = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id; 
  
  if (!landlordId) {
    throw new Error("Unauthorized access. Landlord ID missing.");
  }

  const { id } = req.params;
  const { isAvailable } = req.body; 

  const result = await PropertyService.updateAvailability(id as string, isAvailable, landlordId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Property availability status updated successfully!",
    data: result,
  });
});




// Delete Property 
const deleteProperty = catchAsync(async ( req : Request, res : Response ) => {
    const landlordId = req.user?.id
    if (!landlordId) {
    throw new Error("Unauthorized access. Landlord ID missing.");
}

    const propertyId = req.params.propertyId;
    if (!propertyId) {
        throw new Error("Property Id Required In Params")
    }

    await PropertyService.deleteProperty(propertyId as string, landlordId as string )

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property deleted successfully",
        data: null
    })
})




// Get Own Properties
const getMyProperties = catchAsync(async ( req : Request, res : Response ) => {
    const landlordId = req.user?.id;

    const result = await PropertyService.getMyProperties(landlordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My Properties retrieved successfully",
        data: result
    })
})









export const PropertyController = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getMyProperties,
    changePropertyStatus,
    toggleAvailability
}