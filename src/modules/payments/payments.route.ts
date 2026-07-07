import express from 'express';
import { PaymentController } from './payments.controller';
import { auth } from '../../middleware/auth';
import { Role } from '../../../generated/prisma/enums';




const router = express.Router();


// Payemnent Creation Route (Only accessible by TENANT role)
router.post(
    '/create',
    auth(Role.TENANT), 
    PaymentController.createPaymentIntent
);


// Payment Confirmation Route (Accessible by TENANT, LANDLORD, and ADMIN roles)
router.post(
    '/confirm',
    PaymentController.confirmPayment
);

// Payment History Route (Only accessible by TENANT role)
router.get(
    '/',
    auth(Role.TENANT),
    PaymentController.getPaymentHistory
);

// Payment Details Route (Accessible by TENANT, LANDLORD, and ADMIN roles)
router.get(
    '/:id',
    auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
    PaymentController.getPaymentDetails
);



export const PaymentRoutes = router;
