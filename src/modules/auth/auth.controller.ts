import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";



// Login User
const loginUser =  catchAsync ( async ( req: Request, res: Response ) => {
    const payload = req.body

    const { accessToken, refreshToken } = await authService.loginUser(payload)

    res.cookie( "accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.cookie( "refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged in Successfully",
        data: { accessToken, refreshToken }
    })
})




// Refresh Token
const refreshToken = catchAsync ( async ( req: Request, res: Response ) => {
    const refreshToken = req.cookies.refreshToken

    const { accessToken } = await authService.refreshToken(refreshToken);


    res.cookie( "accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })

     sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Access token retrieved successfully",
        data: { accessToken }
    })

})


export const authController = {
    loginUser,
    refreshToken
}