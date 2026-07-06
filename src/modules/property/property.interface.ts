import { PropertyWhereInput } from "../../../generated/prisma/models";

export interface ICreatePropertyPayload {
    title: string;
    description: string;
    location: string;
    city: string;
    pricePerDay: number; 
    images: string[];
    categoryId: string; 
    isAvailable?: boolean;
}

export interface IUpdatePropertyPayload {
    title?: string;
    description?: string;
    location?: string;
    city?: string;
    pricePerDay?: number;
    images?: string[];
    categoryId?: string; 
    isAvailable?: boolean;
}

export interface IPropertyQuery extends PropertyWhereInput {
    searchTerm?: string;
    city?: string;
    categoryId?: string; // Query matching relation key variable setup parameters lookup logic
    maxPrice?: string;
    minPrice?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
}
