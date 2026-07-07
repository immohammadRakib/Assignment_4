import express from "express";
import { AdminController } from "./admin.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

// সব ইউজার দেখা
router.get("/users", auth(Role.ADMIN), AdminController.getAllUsers);

// ইউজার ব্যান/আনব্যান করা
router.patch("/users/:id", auth(Role.ADMIN), AdminController.updateUserStatus);

// সব প্রপার্টি দেখা
router.get("/properties", auth(Role.ADMIN), AdminController.getAllProperties);

// সব বুকিং/রেন্টাল রিকোয়েস্ট দেখা
router.get("/rentals", auth(Role.ADMIN), AdminController.getAllRentals);

export const AdminRoutes = router;
