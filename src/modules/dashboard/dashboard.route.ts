import express from 'express';
import { DashboardController } from './dashboard.controller';
import { auth } from '../../middleware/auth';
import { Role } from '../../../generated/prisma/enums';


const router = express.Router();


router.get(
    '/stats', 
    auth( Role.ADMIN, Role.LANDLORD, Role.TENANT ), 
    DashboardController.getDashboardStats
);

export const DashboardRoutes = router;
