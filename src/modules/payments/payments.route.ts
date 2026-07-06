import express from 'express';
import { PaymentController } from './payments.controller';
import { auth } from '../../middleware/auth';
import { Role } from '../../../generated/prisma/enums';

const router = express.Router();

// ১. অনুমোদিত রেন্টাল রিকোয়েস্টের জন্য পেমেন্ট সেশন তৈরি করা
// Endpoint: POST /api/payments/create
router.post(
    '/create',
    auth(Role.TENANT), // শুধুমাত্র টেন্যান্ট পেমেন্ট শুরু করতে পারবে
    PaymentController.createPaymentIntent
);

// ২. SSLCommerz কলব্যাক রাউট (পেমেন্ট ভেরিফাই করার জন্য)
// নোট: এটি POST হতে হবে কারণ SSLCommerz ডাটা POST মেথডে পাঠায়
// Endpoint: POST /api/payments/confirm
router.post(
    '/confirm',
    PaymentController.confirmPayment
);

// ৩. ইউজারের নিজের পেমেন্ট হিস্টোরি দেখা
// Endpoint: GET /api/payments
// router.get(
//     '/',
//     auth(Role.TENANT),
//     PaymentController.getPaymentHistory
// );

// ৪. নির্দিষ্ট পেমেন্টের বিস্তারিত তথ্য দেখা
// Endpoint: GET /api/payments/:id
// router.get(
//     '/:id',
//     auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
//     PaymentController.getPaymentDetails
// );

export const PaymentRoutes = router;
