import { NextFunction, Request, Response } from "express";
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
const getAllProperties = catchAsync(async ( req : Request, res : Response ) => {
    const query = {
        role: req.user?.role,       
        landlordId: req.user?.id   
    };
    
    const result = await PropertyService.getAllProperties( query );

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Properties Retrieved Successfully",
        data : result
    })
})



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
        message : "Property retrieved successfuly",
        data : result
    })
})



// Update Property By Id
const updateProperty = catchAsync(async ( req : Request, res : Response ) => {
    const landlordId = req.user?.id
    const isLandlord = req.user?.role === "LANDLORD";
    if (!landlordId) {
    throw new Error("Unauthorized access. Landlord ID missing.");
}

    const propertyId = req.params.propertyId;

    if (!propertyId) {
        throw new Error("Property Id Required In Params")
    }

    const payload = req.body;

    const result = await PropertyService.updateProperty( propertyId as string, payload, landlordId as string, isLandlord );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: result
    })
})



// Toggle Property Availability
const toggleAvailability = catchAsync(async ( req: Request, res: Response ) => {
  const { id } = req.params;
  const { isAvailable } = req.body; 

  const result = await PropertyService.updateAvailability( id as string, isAvailable );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Property availability status updated successfully!",
    data: result,
  });
});



// Delete Property 
const deleteProperty = catchAsync(async ( req : Request, res : Response ) => {
    const landlordId = req.user?.id
    const isLandlord = req.user?.role === "LANDLORD";
    if (!landlordId) {
    throw new Error("Unauthorized access. Landlord ID missing.");
}

    const propertyId = req.params.propertyId;
    if (!propertyId) {
        throw new Error("Property Id Required In Params")
    }

    await PropertyService.deleteProperty(propertyId as string, landlordId as string, isLandlord)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property deleted successfully",
        data: null
    })
})

const getPropertiesStats = catchAsync(async ( req : Request, res : Response ) => {
    const result = await PropertyService.getPropertiesStats();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property stats retrieved successfully",
        data: result
    })
})



// Get Own Properties
const getMyProperties = catchAsync(async ( req : Request, res : Response ) => {
    const landlordId = req.user?.id;

    const result = await PropertyService.getMyProperties(landlordId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My Properties retrieved successfuly",
        data: result
    })
})




export const PropertyController = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getPropertiesStats,
    getMyProperties,
    toggleAvailability
}