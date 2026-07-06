import { ICategory } from "./category.interface";
import { prisma } from "../../lib/prisma";





// Create a new category in the database
const createCategory = async (payload: ICategory): Promise<ICategory> => {
  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

// get all categories with the count of properties associated with each category
const getAllCategories = async (): Promise<ICategory[]> => {
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: { properties: true }, 
      },
    },
  });
  return result;
};





export const CategoryService = {
  createCategory,
  getAllCategories,
};
