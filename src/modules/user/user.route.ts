import { Router, Request, Response, NextFunction } from "express";
import { userController } from "./user.controller";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { Role } from "../../../generated/prisma/enums";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { auth } from "../../middleware/auth";




const router = Router();



router.post('/register', userController.registerUser)

// const auth = ( ...requiredRoles: Role[] ) => {
//     return catchAsync( async ( req: Request, res: Response, next: NextFunction ) => {
//         const token = req.cookies.accessToken ? req.cookies.accessToken
//         : req.headers.authorization?.startsWith("Bearer") ? 
//         req.headers.authorization?.split(" ")[1] : req.headers.authorization;

//         if( !token ){
//             throw new Error("Your are not logged in, please log in to access this resource")
//         }

//         const verifiedToken = jwtUtils.verifyToken( token, config.jwt_access_secret )

//         if( !verifiedToken.success ){
//             throw new Error(verifiedToken.error)
//         }

//     const { name, email, id, role } = verifiedToken.data as JwtPayload;
//     const requiredRole = [ Role.ADMIN, Role.AUTHOR, Role.USER ]
//     if( requiredRole.length && !requiredRole.includes(role) ) {
//         return res.status(403).json({
//             success: false,
//             statusCode: httpStatus.FORBIDDEN,
//             message: "Forbidden, you don't have permission to have this resource"
//         })
//     }

//     const user = await prisma.user.findUnique({
//         where: {
//             id,
//             email,
//             name,
//             role
//         }
//     })

//     if( !user ){
//         throw new Error("user not found, Please log in again")
//     }

//     if( user.activeStatus === "BLOCKED"){
//         throw new Error("your account blocked, contract support")
//     }
//         req.user = {
//         id,
//         name,
//         email,
//         role
//     }
//     next();

//  })
// }


router.get('/me', 
    
    
//     (req: Request, res: Response, next: NextFunction) => {
//     console.log(req.cookies)

//     const { accessToken } = req.cookies
//     const verifiedToken = jwtUtils.verifyToken( accessToken, config.jwt_access_secret)
//     // if( typeof verifiedToken === 'string' ){
//     //     throw new Error( verifiedToken )
//     // }

//      if( !verifiedToken.success ){
//             throw new Error(verifiedToken.error)
//         }

//     const { name, email, id, role } = verifiedToken.data as JwtPayload;
//     const requiredRole = [ Role.ADMIN, Role.AUTHOR, Role.USER ]
//     if( !requiredRole.includes(role) ) {
//         return res.status(403).json({
//             success: false,
//             statusCode: httpStatus.FORBIDDEN,
//             message: "Forbidden, you don't have permission to have this resource"
//         })
//     }

   


//     next();
// }, 

auth( Role.ADMIN, Role.TENANT, Role.LANDLORD ),
userController.getMyProfile)


router.put('/my-profile', auth( Role.ADMIN, Role.TENANT, Role.LANDLORD ), userController.updateMyProfile )


export const userRoute = router;