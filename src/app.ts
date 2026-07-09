import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { UserRoutes } from './modules/user/user.route';
import { authRoutes } from './modules/auth/auth.route';
import { RentalRoutes } from "./modules/booking/booking.route";
import { PropertyRoutes } from "./modules/property/property.route";
import { PaymentRoutes } from "./modules/payments/payments.route";
import { CategoryRoutes } from "./modules/categories/category.route";
import { ReviewRoutes } from "./modules/review/review.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { AdminRoutes } from "./modules/admin/admin.route";
import { DashboardRoutes } from "./modules/dashboard/dashboard.route";




const app: Application = express();

app.use(cors({
    origin: config.app_url,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


// User Register
app.get("/", ( req: Request, res: Response ) => {
    res.send("Hello, World!");
});

// Auth 
app.use('/api/auth', UserRoutes);
app.use('/api/auth', authRoutes);

// Property and Rentals
app.use('/api', PropertyRoutes); 
app.use('/api/rentals', RentalRoutes);

// Payments 
app.use('/api/payments', PaymentRoutes); 

// Reviews and Categories
app.use("/api/reviews", ReviewRoutes);
app.use("/api/categories", CategoryRoutes);

// Admin
app.use('/api/admin', AdminRoutes);
app.use('/api/dashboard', DashboardRoutes)


// Error Handler
app.use(notFound);
app.use(globalErrorHandler);


export default app;