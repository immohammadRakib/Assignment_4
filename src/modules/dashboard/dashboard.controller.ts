import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DashboardService } from "./dashboard.service";



//Property Stats for Landlord and Admin
const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const role = req.user?.role;
    const userId = req.user?.id;
    let result;

    if (role === "ADMIN") {
        result = await DashboardService.getAdminDashboardStats();
    } else if (role === "LANDLORD") {
        result = await DashboardService.getLandlordDashboardStats(userId as string);
    } else {
        throw new Error("You are not authorized to view dashboard stats!");
    }

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: `${role} Dashboard stats fetched successfully`,
        data: result
    });
});




export const DashboardController = {
    getDashboardStats
}