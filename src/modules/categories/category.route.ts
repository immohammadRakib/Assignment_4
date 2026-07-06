import express from "express";
import { CategoryController } from "./category.controller";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middleware/auth";

const router = express.Router();

// create a new category route (only accessible by admin)
router.post(
  "/create",
  auth( Role.ADMIN ), 
  CategoryController.createCategory
);


router.get("/", CategoryController.getAllCategories);

export const CategoryRoutes = router;
