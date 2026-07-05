import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PropertyService } from "./property.service";

const createProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;

    const result = await PropertyService.createProperty(payload, id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Property created successfully",
        data: result
    });
});

const getAllProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await PropertyService.getAllProperties(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Properties retrieved successfully",
        data: result
    });
});

const getPropertyById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id; // Type casting block setup below

    if (!id) {
        throw new Error("Property Id Required In Params");
    }

    const result = await PropertyService.getPropertyById(id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property details retrieved successfully",
        data: result
    });
});

const updateProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const id = req.params.id;

    if (!id) {
        throw new Error("Property Id Required In Params");
    }

    const payload = req.body;
    const result = await PropertyService.updateProperty(id as string, payload, landlordId as string, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property updated successfully",
        data: result
    });
});

const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    const id = req.params.id;
    if (!id) {
        throw new Error("Property Id Required In Params");
    }

    await PropertyService.deleteProperty(id as string, landlordId as string, isAdmin);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Property deleted successfully",
        data: null
    });
});

export const PropertyController = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
};
