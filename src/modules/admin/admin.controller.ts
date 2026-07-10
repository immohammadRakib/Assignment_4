import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ActiveStatus } from "../../../generated/prisma/client";
import httpStatus from "http-status";




// Get All Users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {

    const query = req.query; 

    const result = await AdminService.getAllUsers( query );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All users fetched successfully",
        data: result
    });
});


// Update User Status
const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await AdminService.updateUserStatus(id as string, status as ActiveStatus);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User status updated successfully",
        data: result
    });
});


// Get All Property
const getAllProperties = catchAsync(async (req: Request, res: Response) => {

    const query = req.query; 

    const result = await AdminService.getAllProperties( query );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All properties fetched successfully",
        data: result
    });
});


// Get All Rentals
const getAllRentals = catchAsync(async (req: Request, res: Response) => {

    const query = req.query; 

    const result = await AdminService.getAllRentals( query );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All rental requests fetched successfully",
        data: result
    });
});





export const AdminController = {
    getAllUsers,
    updateUserStatus,
    getAllProperties,
    getAllRentals
};
