import crypto from 'crypto';
import https from 'https';

const tmnCodes = [
    { tmn: "CGXZLS0Z", hash: "XNBCJFAKAZQSGTARRLGCHVZWCIOIGGND" },
    { tmn: "2CY2O71S", hash: "WHEIILAMUUXRLYZJUVTIRNYNURJROAHS" },
    { tmn: "8NDSNBG0", hash: "NDLZZRBSXQZBSQPFJLYNSDBYHQZJZXWW" },
    { tmn: "HDO2OS3E", hash: "SVLPEAYDITIVGNDLUBOGJUBBTVTVOTCQ" }
];

function createUrl(tmn, hashSecret) {
    let date = new Date();
    const createDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
    let expireDateObj = new Date(date.getTime() + 15 * 60000);
    const expireDate = `${expireDateObj.getFullYear()}${String(expireDateObj.getMonth() + 1).padStart(2, '0')}${String(expireDateObj.getDate()).padStart(2, '0')}${String(expireDateObj.getHours()).padStart(2, '0')}${String(expireDateObj.getMinutes()).padStart(2, '0')}${String(expireDateObj.getSeconds()).padStart(2, '0')}`;

    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': tmn,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': Math.floor(Math.random() * 100000).toString(),
        'vnp_OrderInfo': 'Thanh toan test',
        'vnp_OrderType': 'other',
        'vnp_Amount': 100000 * 100,
        'vnp_ReturnUrl': 'http://localhost:5005/api/payment/vnpay_return',
        'vnp_IpAddr': '127.0.0.1',
        'vnp_CreateDate': createDate,
        'vnp_ExpireDate': expireDate
    };

    let sorted = {};
    let str = Object.keys(vnp_Params).sort();
    for (let key of str) {
        sorted[key] = encodeURIComponent(vnp_Params[key]).replace(/%20/g, "+");
    }

    let signData = Object.keys(sorted).map(k => `${k}=${sorted[k]}`).join('&');
    let hmac = crypto.createHmac("sha512", hashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    sorted['vnp_SecureHash'] = signed;
    
    return 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?' + Object.keys(sorted).map(k => `${k}=${sorted[k]}`).join('&');
}

async function checkUrl(url, tmn) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            const loc = res.headers.location;
            console.log(`[${tmn}] HTTP ${res.statusCode} Loc: ${loc}`);
            resolve(loc);
        }).on('error', (e) => {
            console.error(`[${tmn}] Error:`, e);
            resolve(false);
        });
    });
}

async function run() {
    for (let c of tmnCodes) {
        const url = createUrl(c.tmn, c.hash);
        await checkUrl(url, c.tmn);
    }
}
run();
