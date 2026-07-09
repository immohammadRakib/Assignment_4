import { ICategory } from "./category.interface";
import { prisma } from "../../lib/prisma";





// Create a new category in the database
const createCategory = async (payload: ICategory) => {
  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};



// get all categories 
const getAllCategories = async () => {
  const result = await prisma.category.findMany({
    include: {
      _count: {
        select: { properties: true }, 
      },
    },
  });
  return result;
};



// Delete Category
const deleteCategory = async (id: string) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
    include: {
        _count: {
            select: { properties: true }, 
        },
        properties: true,
    },
  });

  if (!isExist) {
    throw new Error("Category not found!");
  }

  if (isExist._count.properties > 0) {
    throw new Error("Cannot delete this category because it contains active property listings! Delete those properties first.");
  }

  const result = await prisma.category.delete({
    where: { id }
  });
  return result;
};


// Get All Property Under a Category
const getCategoryWithPropertyCount = async (id: string) => {
  const result = await prisma.category.findUnique({
    where: { id },
    include: {
        _count: {
            select: { properties: true }, 
        },
        properties: true,
    },
  });

  if (!result) {
    throw new Error("Category not found!");
  }

  return result;
};



export const CategoryService = {
  createCategory,
  getAllCategories,
  deleteCategory,
  getCategoryWithPropertyCount
};
