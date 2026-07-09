import { Request, Response } from "express"; 
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";






// Register User
const registerUser = catchAsync( async ( req: Request, res: Response ) => {
    const payload = req.body;

    const user  = await userService.registerUserIntoDB(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: user
    })
});





// Get Profile
const getMyProfile = catchAsync( async ( req: Request, res: Response ) => {
    const profile = await userService.getMyProfileIntoDB( req.user?.id as string )

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile fetched successfully",
        data: profile 
    })
})





// Update Profile
const updateMyProfile = catchAsync( async ( req: Request, res: Response ) => {
    const userId = req.user?.id as string

    const payload = req.body

    const updatedProfile = await userService.updateMyProfileIntoDB( userId, payload )

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Updated successfully",
        data: updatedProfile
    })
})






export const userController = {
    registerUser,
    getMyProfile,
    updateMyProfile
}