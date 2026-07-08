import { Booking, User } from "../../../generated/prisma/client"
import config from "../../config"
import axios from "axios"
import { prisma } from "../../lib/prisma";




// Payement initiation method for a booking
const initialPayement = async (bookingId: string, user: User) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tenant: true, property: true }
    });

    if (!booking || booking.tenantId !== user.id) {
        throw new Error("Booking not found!");
    }

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
        success_url: `${config.app_url}/api/payments/confirm?tranId=${tranId}&bookingId=${bookingId}`,
        fail_url: `${config.app_url}/api/payments/fail?tranId=${tranId}&bookingId=${bookingId}`,
        cancel_url: `${config.app_url}/api/payments/cancel?tranId=${tranId}&bookingId=${bookingId}`,
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




// Verify payment after redirection from SSLCommerz
const verifyPayment = async (tranId: string, bookingId: string, paymentResponse: any) => {
    if (paymentResponse && paymentResponse.status === 'VALID') {
        const transactionResult = await prisma.$transaction(async (tx) => {
            
            const paymentResult = await tx.payment.create({
                data: {
                    transactionId: tranId,
                    bookingId: bookingId,
                    amount: Number(paymentResponse.amount),
                    status: "PAID", 
                    method: paymentResponse.card_type
                }
            });

            const currentBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: "PAID"
                }
            });

            await tx.booking.updateMany({
                where: {
                    propertyId: currentBooking.propertyId,
                    id: { not: bookingId }, 
                    status: "PENDING",
                    startDate: { lte: currentBooking.endDate },
                    endDate: { gte: currentBooking.startDate }
                },
                data: {
                    status: "REJECTED" 
                }
            });

            return paymentResult;
        });

        return { data: transactionResult };
    }

    return { success: false, message: "Payment verification failed" };
};






// Get payment history for a specific user
const getPaymentHistoryFromDB = async (userId: string) => {
    return await prisma.payment.findMany({
        where: {
            booking: {
                tenantId: userId
            }
        },
        include: {
            booking: {
                include: { property: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}




// Get specific payment details by ID
const getPaymentDetailsFromDB = async (id: string) => {
    return await prisma.payment.findUniqueOrThrow({
        where: { id },
        include: {
            booking: {
                include: { property: true, tenant: true }
            }
        }
    });
}





export const paymentService = {
    initialPayement,
    verifyPayment,
    getPaymentHistoryFromDB,
    getPaymentDetailsFromDB
}
