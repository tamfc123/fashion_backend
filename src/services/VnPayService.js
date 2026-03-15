import crypto from 'crypto';
import querystring from 'querystring';
import { vnpayConfig } from '../config/vnpay.js';

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

function getFormattedDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const SS = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}${HH}${MM}${SS}`;
}

const VnPayService = {
    createPaymentUrl: (orderId, amount, ipAddr, orderInfo = "Thanh toan don hang") => {
        let date = new Date();
        let createDate = getFormattedDate(date);

        // Add 15 minutes for expiration
        let expireDateObj = new Date(date.getTime() + 15 * 60000);
        let expireDate = getFormattedDate(expireDateObj);

        let tmnCode = vnpayConfig.vnp_TmnCode;
        let secretKey = vnpayConfig.vnp_HashSecret;
        let vnpUrl = vnpayConfig.vnp_Url;
        let returnUrl = vnpayConfig.vnp_ReturnUrl;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr || '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;

        vnp_Params = sortObject(vnp_Params);

        let signData = Object.keys(vnp_Params)
            .map(key => `${key}=${vnp_Params[key]}`)
            .join('&');
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        vnp_Params['vnp_SecureHash'] = signed;
        const queryParamsString = Object.keys(vnp_Params)
            .map(key => `${key}=${vnp_Params[key]}`)
            .join('&');
        vnpUrl += '?' + queryParamsString;

        return vnpUrl;
    },

    verifyReturn: (vnp_Params) => {
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        let secretKey = vnpayConfig.vnp_HashSecret;
        let signData = Object.keys(vnp_Params)
            .map(key => `${key}=${vnp_Params[key]}`)
            .join('&');
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            // Verify success, check response code
            return vnp_Params['vnp_ResponseCode'] === '00';
        } else {
            return false;
        }
    }
};

export default VnPayService;
