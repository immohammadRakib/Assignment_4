import express from "express";
import { AdminController } from "./admin.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

// All Users
router.get("/users", auth(Role.ADMIN), AdminController.getAllUsers);

// User Status
router.patch("/users/:id", auth(Role.ADMIN), AdminController.updateUserStatus);

// All Property
router.get("/properties", auth(Role.ADMIN), AdminController.getAllProperties);

// All Rental Request
router.get("/rentals", auth(Role.ADMIN), AdminController.getAllRentals);



export const AdminRoutes = router;