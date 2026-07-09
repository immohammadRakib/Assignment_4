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

// GET endpoint to get property count under a category
router.get("/:id", CategoryController.getCategoryWithPropertyCount);

// Get all Categories for all
router.get("/", CategoryController.getAllCategories);

// Delete categories for admin
router.delete("/:id", auth( Role.ADMIN ), CategoryController.deleteCategory);


export const CategoryRoutes = router;
