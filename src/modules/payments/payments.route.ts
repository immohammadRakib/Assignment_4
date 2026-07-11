import express from 'express';
import { PaymentController } from './payments.controller';
import { auth } from '../../middleware/auth';
import { Role } from '../../../generated/prisma/enums';




const router = express.Router();




// Payment Confirmation Route (Accessible by TENANT, LANDLORD, and ADMIN roles)
// router.post(
//     '/confirm',
//     PaymentController.confirmPayment
// );
router.route('/fail')
    .get(PaymentController.failPayment)
    .post(PaymentController.failPayment);

router.route('/confirm')
    .get(PaymentController.confirmPayment)
    .post(PaymentController.confirmPayment);

router.route('/cancel')
    .get(PaymentController.cancelPayment)
    .post(PaymentController.cancelPayment);

// Payment Failed
// router.post(
//     '/fail',
//     PaymentController.failPayment
// );



// Payment Cancelled
// router.post(
    //     '/cancel',
    //     PaymentController.cancelPayment
    // );
    
    
    // Payemnent Creation Route (Only accessible by TENANT role)
    router.post(
        '/create',
        auth(Role.TENANT), 
        PaymentController.createPaymentIntent
    );


// Payment History Route
router.get(
    '/',
    auth( Role.TENANT, Role.ADMIN, Role.LANDLORD ),
    PaymentController.getPaymentHistory
);



// Payment Details Route (Accessible by TENANT, LANDLORD, and ADMIN roles)
router.get(
    '/:id',
    auth( Role.TENANT, Role.LANDLORD, Role.ADMIN ),
    PaymentController.getPaymentDetails
);



export const PaymentRoutes = router;
