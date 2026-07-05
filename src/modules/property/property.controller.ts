import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PropertyService } from "./property.service";

const createProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const id = req.user?.id

    const payload = req.body;

    const result = await PropertyService.createProperty(payload, id as string);


    sendResponse(res, {
        success : true,
        statusCode : httpStatus.CREATED,
        message : "Property Created SuccessFully",
        data : result
    })
})

const getAllProperties = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const result = await PropertyService.getAllProperties();

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Properties Retrieved Successfully",
        data : result
    })
})

const getPropertyById = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const propertyId = req.params.propertyId;

    if(!propertyId){
        throw new Error("Property Id Required In Params")
    }

    const result = await PropertyService.getPropertyById(propertyId as string);

    sendResponse(res, {
        success : true,
        statusCode : httpStatus.OK,
        message : "Property retrieved successfuly",
        data : result
    })
})

const updateProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const landlordId = req.user?.id
    const isAdmin = req.user?.role === "ADMIN";

    const propertyId = req.params.propertyId;

    if (!propertyId) {
        throw new Error("Property Id Required In Params")
    }

    const payload = req.body;

    const result = await PropertyService.updateProperty(propertyId as string, payload, landlordId as string, isAdmin)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: result
    })
})

const deleteProperty = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const landlordId = req.user?.id
    const isAdmin = req.user?.role === "ADMIN";

    const propertyId = req.params.propertyId;
    if (!propertyId) {
        throw new Error("Property Id Required In Params")
    }

    await PropertyService.deleteProperty(propertyId as string, landlordId as string, isAdmin)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property deleted successfully",
        data: null
    })
})

const getPropertiesStats = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const result = await PropertyService.getPropertiesStats();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property stats retrieved successfully",
        data: result
    })
})

const getMyProperties = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
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
    getMyProperties
}