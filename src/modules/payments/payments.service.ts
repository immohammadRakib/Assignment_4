import { Booking, User } from "../../../generated/prisma/client"
import config from "../../config"
import axios from "axios"
import { prisma } from "../../lib/prisma";

const initialPayement = async (bookingId: string, user: User) => {
    // কন্ট্রোলার থেকে আসা bookingId এবং authenticated user ব্যবহার করে বুকিংটি খুঁজে বের করা
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tenant: true, property: true }
    });

    if (!booking || booking.tenantId !== user.id) {
        throw new Error("Booking not found!");
    }

    // ল্যান্ডলর্ড CONFIRMED করলেই কেবল পেমেন্ট শুরু হবে
    if (booking.status !== "CONFIRMED") {
        throw new Error("You cannot pay for this booking until the landlord confirms the request.");
    }

    const tranId = `TRNX-${Date.now()}`;

    const paymentData = {
        store_id: config.ssl_commerz_store_id,
        store_passwd: config.ssl_commerz_store_password,
        total_amount: booking.totalPrice.toString(),
        currency: "BDT",
        tran_id: tranId,
        // কন্ট্রোলার অনুযায়ী কলব্যাক ইউআরএল
        success_url: "http://yoursite.com/success.php",
        fail_url: "http://yoursite.com/fail.php",
        cancel_url: "http://yoursite.com/cancel.php",
        ipn_url: "http://yoursite.com/ipn.php",
        cus_name: user.name,
        cus_email: user.email,
        cus_add1: "N/A",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        shipping_method: "NO",
        product_name: booking.property.title,
        product_category: "Service",
        product_profile: "general",
    };


    const formParams = new URLSearchParams(paymentData);
    
    const response = await axios.post("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", formParams, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = await response.data;
    let GatewayPageURL = data.GatewayPageURL;

    console.log('Redirecting to: ', GatewayPageURL)
    return { GatewayPageURL, tranId };
}

/**
 * SSLCommerz পেমেন্ট ভেরিফাই করার মেথড
 */
// const verifyPayment = async (tranId: string, bookingId: string, paymentResponse: any) => {
//     // ১. পেমেন্ট স্ট্যাটাস VALID কি না চেক করা (SSLCommerz Order Validation API ব্যবহার করা যেতে পারে)
//     if (paymentResponse && paymentResponse.status === 'VALID') {
        
//         // ২. ট্রানজেকশন সফল হলে ডাটাবেজ আপডেট (বুকিং স্ট্যাটাস এবং পেমেন্ট রেকর্ড)
//         const result = await prisma.$transaction(async (tx) => {
//             // বুকিং স্ট্যাটাস আপডেট
//             await tx.booking.update({
//                 where: { id: bookingId },
//                 data: { paymentStatus: "PAID" }
//             });

//             // পেমেন্ট রেকর্ড তৈরি (যদি পেমেন্ট মডেল থাকে)
//             return await tx.payment.create({
//                 data: {
//                     transactionId: tranId,
//                     bookingId: bookingId,
//                     amount: Number(paymentResponse.amount),
//                     paymentStatus: "COMPLETED",
//                     method: paymentResponse.card_type
//                 }
//             });
//         });

//         return { success: true, data: result };
//     }

//     return { success: false, message: "Payment verification failed" };
// }

/**
 * ইউজারের পেমেন্ট হিস্টোরি ডাটাবেজ থেকে আনা
 */
// const getPaymentHistoryFromDB = async (userId: string) => {
//     return await prisma.payment.findMany({
//         where: {
//             booking: {
//                 tenantId: userId
//             }
//         },
//         include: {
//             booking: {
//                 include: { property: true }
//             }
//         },
//         orderBy: { createdAt: 'desc' }
//     });
// }

/**
 * নির্দিষ্ট পেমেন্ট ডিটেইলস আনা
 */
// const getPaymentDetailsFromDB = async (id: string) => {
//     return await prisma.payment.findUniqueOrThrow({
//         where: { id },
//         include: {
//             booking: {
//                 include: { property: true, tenant: true }
//             }
//         }
//     });
// }

export const paymentService = {
    initialPayement,
    // verifyPayment,
    // getPaymentHistoryFromDB,
    // getPaymentDetailsFromDB
}
