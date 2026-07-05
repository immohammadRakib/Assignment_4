import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";  
import config from "../config";
import { jwtUtils } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";


declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                name: string,
                email: string,
                role: Role
            }
        }
    }
}


export const auth = ( ...requiredRoles: Role[] ) => {
    return catchAsync( async ( req: Request, res: Response, next: NextFunction ) => {
        const token = req.cookies.accessToken ? req.cookies.accessToken
        : req.headers.authorization?.startsWith("Bearer") ? 
        req.headers.authorization?.split(" ")[1] : req.headers.authorization;

        if( !token ){
            throw new Error("Your are not logged in, please log in to access this resource")
        }

        const verifiedToken = jwtUtils.verifyToken( token, config.jwt_access_secret )

        if( !verifiedToken.success ){
            throw new Error(verifiedToken.error)
        }

    const { name, email, id, role } = verifiedToken.data as JwtPayload;
    const requiredRole = [ Role.ADMIN, Role.LANDLORD, Role.TENANT ];
    if( requiredRole.length && !requiredRole.includes(role) ) {
        return res.status(403).json({
            success: false,
            statusCode: httpStatus.FORBIDDEN,
            message: "Forbidden, you don't have permission to have this resource"
        })
    }

    const user = await prisma.user.findFirst({
        where: {
            id,
            email,
            name,
            role
        }
    })

    if( !user ){
        throw new Error("user not found, Please log in again")
    }

    // if( user.activeStatus === "BLOCKED"){
    //     throw new Error("your account blocked, contract support")
    // }
    //     req.user = {
    //     id,
    //     name,
    //     email,
    //     role
    // }
    next();

 })
}
