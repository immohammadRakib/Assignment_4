import { Router, Request, Response, NextFunction } from "express";
import { userController } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";




const router = Router();



router.post('/register', userController.registerUser)

router.get('/me', 
auth( Role.ADMIN, Role.TENANT, Role.LANDLORD ),
userController.getMyProfile)


router.put('/my-profile', auth( Role.ADMIN, Role.TENANT, Role.LANDLORD ), userController.updateMyProfile )


export const userRoute = router;