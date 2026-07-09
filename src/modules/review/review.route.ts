import express from "express";
import { ReviewController } from "./review.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";



const router = express.Router();

router.post(
    "/create",
    auth(Role.TENANT), 
    ReviewController.createReview
);

router.delete(
    '/:reviewId',
    auth(Role.TENANT),
    ReviewController.deleteReview
);

router.get(
    "/property/:propertyId", 
    ReviewController.getPropertyReviews
);



export const ReviewRoutes = router;
