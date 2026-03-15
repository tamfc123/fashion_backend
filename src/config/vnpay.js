import dotenv from 'dotenv';
dotenv.config();

export const vnpayConfig = {
    vnp_TmnCode: process.env.VNP_TMN_CODE || 'HDO2OS3E', // Sandbox TMN Code
    vnp_HashSecret: process.env.VNP_HASH_SECRET || 'SVLPEAYDITIVGNDLUBOGJUBBTVTVOTCQ', // Sandbox Hash Secret
    vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_Api: process.env.VNP_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:5005/api/payment/vnpay_return',
};
