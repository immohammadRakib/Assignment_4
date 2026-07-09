import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";




// Create a new category controller
const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});



// get all categories controller
const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});




// Delete A Category
const deleteCategory = catchAsync( async ( req: Request, res: Response ) => {
    const { id } = req.params
    const result = await CategoryService.deleteCategory( id as string )

    sendResponse( res, {
        statusCode: 200,
        success: true,
        message: "Category deleted successfully",
        data: result,
    })
})




// Get All Property Under a Category
const getCategoryWithPropertyCount = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CategoryService.getCategoryWithPropertyCount( id as string );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category with property count retrieved successfully!",
    data: result,
  });
});






export const CategoryController = {
  createCategory,
  getAllCategories,
  deleteCategory,
  getCategoryWithPropertyCount
};
