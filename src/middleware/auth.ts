import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import httpStatus from "http-status"; 

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                name: string;
                id: string;
                role: Role;
            }
        }
    }
}


// Auth Middleware
export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        
        // Token Access
        const token = req.cookies.accessToken ?
            req.cookies.accessToken 
            :
            req.headers.authorization?.startsWith("Bearer ") ? 
            req.headers.authorization?.split(" ")[1] 
            : req.headers.authorization;

        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                statusCode: httpStatus.UNAUTHORIZED,
                message: "You are not logged in. Please log in to access this resource."
            });
        }

        // Token Verify
        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

        if (!verifiedToken.success) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                statusCode: httpStatus.UNAUTHORIZED,
                message: verifiedToken.error || "Token verification failed."
            });
        }

        const { email, name, id, role } = verifiedToken.data as JwtPayload;

        // Role and Permission Check
        if (requiredRoles.length && !requiredRoles.includes(role)) {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                statusCode: httpStatus.FORBIDDEN,
                message: "Forbidden. You don't have permission to access this resource."
            });
        }

        // Database Check 
        const user = await prisma.user.findUnique({
            where: {
                id: id 
            }
        });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                statusCode: httpStatus.NOT_FOUND,
                message: "User not found. Please log in again."
            });
        }

        // Account Status Check
        if (user.activeStatus === "BLOCKED") {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                statusCode: httpStatus.FORBIDDEN,
                message: "Your account has been blocked. Please contact admin"
            });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as Role
        };

        next();
    });
};
