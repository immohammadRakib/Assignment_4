import { User } from "../../../generated/prisma/client";
import config from "../../config";
import axios from "axios";
import { prisma } from "../../lib/prisma";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums"; 




// Initiate Payment 
const initialPayment = async (bookingId: string, user: User) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tenant: true, property: true }
    });

    if (!booking || booking.tenantId !== user.id) {
        throw new Error("Booking not found!");
    }

    if (booking.status !== BookingStatus.CONFIRMED ) {
        throw new Error("You cannot pay for this booking until the landlord confirms the request.");
    }

    const tranId = `TRNX-${Date.now()}`;

      await prisma.payment.upsert({
        where: { bookingId: bookingId },
        update: {
            transactionId: tranId,
            status: "PENDING", 
            amount: booking.totalPrice,
        },
        create: {
            transactionId: tranId,
            propertyId: booking.propertyId,
            bookingId: bookingId,
            amount: booking.totalPrice,
            status: "PENDING", 
            method: "SSLCOMMERZ",
        }
    });

    const paymentData = {
        store_id: config.ssl_commerz_store_id,
        store_passwd: config.ssl_commerz_store_password,
        total_amount: booking.totalPrice.toFixed(2),
        currency: "BDT",
        tran_id: tranId,
        success_url: `${config.app_url}/confirm?tranId=${tranId}&bookingId=${bookingId}`,
        fail_url: `${config.app_url}/fail?tranId=${tranId}&bookingId=${bookingId}`,
        cancel_url: `${config.app_url}/cancel?tranId=${tranId}&bookingId=${bookingId}`,
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

    const data = response.data;
    let GatewayPageURL = data.GatewayPageURL;

    console.log('Redirecting to: ', GatewayPageURL);
    return { GatewayPageURL, tranId };
};




// Verify payment after redirection from SSLCommerz
const verifyPayment = async (tranId: string, bookingId: string, paymentResponse: any) => {
    if (paymentResponse && paymentResponse.status === 'VALID') {
        const transactionResult = await prisma.$transaction(async (tx) => {

            const paymentResult = await tx.payment.update({
                where: { transactionId: tranId },
                data: {
                    status: "PAID", 
                    method: paymentResponse.card_type,
                    amount: Number(paymentResponse.amount),
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
                    AND: [
                        { startDate: { lt: currentBooking.endDate } },
                        { endDate: { gt: currentBooking.startDate } }
                    ]
                },
                data: {
                    status: "REJECTED" 
                }
            });

            return paymentResult;
        });

        return { success: true, data: transactionResult };
    }

    return { success: false, message: "Payment verification failed" };
};




// Handle Failed Payment
const handleFailedPaymentInDB = async (tranId: string, bookingId: string) => {
    return await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { transactionId: tranId },
            data: { status: "FAILED" }
        });

        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.CONFIRMED } 
        });

        return updatedBooking;
    });
};




// Handle Cancelled Payment
const handleCancelledPaymentInDB = async (tranId: string, bookingId: string) => {
    return await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { transactionId: tranId },
            data: { status: BookingStatus.CANCELLED }
        });

        const updatedBooking = await tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.PENDING }
        });

        return updatedBooking;
    });
};





// Get payment history based on User Role (Admin, Landlord, Tenant)
const getPaymentHistoryFromDB = async (userId: string, role: string) => {
    let whereCondition: any = {};
    if (role === "TENANT") {
        whereCondition = {
            booking: {
                tenantId: userId
            }
        };
    }

    if (role === "LANDLORD") {
        whereCondition = {
            booking: {
                property: {
                    landlordId: userId
                }
            }
        };
    }

    return await prisma.payment.findMany({
        where: whereCondition, 
        include: {
            booking: {
                include: { 
                    property: true,
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};





// Get specific payment details by ID with strict security check
const getPaymentDetailsFromDB = async (id: string, userId: string, role: string) => {
    const payment = await prisma.payment.findUniqueOrThrow({
        where: { id },
        include: {
            booking: {
                include: {
                    property: {
                        select: { landlordId: true, title: true, location: true } 
                    },
                    tenant: {
                         select: { id: true, name: true, email: true, role: true } 
                    }
                }
            }
        }
        
    });

    if (role === "ADMIN") {
        return payment;
    }

    if (role === "TENANT" && payment.booking.tenantId !== userId) {
        throw new Error("You are not authorized to view this payment details!");
    }

    if (role === "LANDLORD" && payment.booking.property.landlordId !== userId) {
        throw new Error("This payment does not belong to your property listings!");
    }

    return payment;
};




export const paymentService = {
    initialPayment, 
    verifyPayment,
    getPaymentHistoryFromDB,
    getPaymentDetailsFromDB,
    handleFailedPaymentInDB,
    handleCancelledPaymentInDB
};
