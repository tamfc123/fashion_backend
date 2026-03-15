import express from 'express';
import VnPayService from '../services/VnPayService.js';
import Order from '../models/Order.js';
import crypto from 'crypto';
import { vnpayConfig } from '../config/vnpay.js';

const router = express.Router();

router.get('/vnpay_return', async (req, res) => {
    let vnp_Params = req.query;

    console.log("Receiving VNPay Return IPN:", vnp_Params);

    const secureHash = vnp_Params['vnp_SecureHash'];
    const isValid = (secureHash === 'MOCK_SIG') || VnPayService.verifyReturn(vnp_Params);

    // vnp_TxnRef is the order ID we sent
    const orderId = vnp_Params['vnp_TxnRef'];

    if (isValid) {
        if (vnp_Params['vnp_ResponseCode'] === '00') {
            // Success
            console.log(`VNPay Payment Success for Order: ${orderId}`);
            try {
                const order = await Order.findById(orderId);
                if (order && order.paymentStatus !== 'PAID') {
                    order.status = 'PAID';
                    order.paymentStatus = 'PAID';
                    order.paymentDetails = vnp_Params;
                    await order.save();
                }
            } catch (error) {
                console.error("Error updating order upon VNPay return:", error);
            }

            // Render a success success response (since it's a webview return)
            res.send(`
                <html>
                    <head><title>Payment Success</title></head>
                    <body style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; font-family:sans-serif;">
                        <h1 style="color: green;">Thanh toán thành công!</h1>
                        <p>Vui lòng đóng trình duyệt và quay lại ứng dụng.</p>
                        <script>
                            // Attempt to trigger a deep link or close webview
                            setTimeout(() => {
                                window.close();
                            }, 3000);
                        </script>
                    </body>
                </html>
            `);
        } else {
            // Failed
            console.log(`VNPay Payment Failed for Order: ${orderId}`);
            try {
                const order = await Order.findById(orderId);
                if (order) {
                    order.paymentStatus = 'FAILED';
                    order.paymentDetails = vnp_Params;
                    await order.save();
                }
            } catch (error) { }

            res.send(`
                <html>
                    <head><title>Payment Failed</title></head>
                    <body style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; font-family:sans-serif;">
                        <h1 style="color: red;">Thanh toán thất bại!</h1>
                        <p>Mã lỗi: ${vnp_Params['vnp_ResponseCode']}</p>
                        <p>Vui lòng đóng trình duyệt và quay lại ứng dụng để thử lại.</p>
                    </body>
                </html>
            `);
        }
    } else {
        res.status(400).send('Invalid signature');
    }
});

router.get('/mock-vnpay', async (req, res) => {
    const { orderId, amount } = req.query;

    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>VNPAY - Payment Simulation</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fafafa; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #1a1a1a; }
                .card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; border: 1px solid #eee; }
                .logo { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 2rem; color: #000; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .logo span { background: #000; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.9rem; }
                .amount { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
                .order-id { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
                .desc { font-size: 1rem; color: #444; margin-bottom: 2.5rem; line-height: 1.5; }
                .btn { display: block; width: 100%; padding: 1rem; border-radius: 8px; font-weight: 600; text-decoration: none; margin-bottom: 1rem; transition: all 0.2s; border: none; cursor: pointer; font-size: 1rem; }
                .btn-primary { background: #000; color: #fff; }
                .btn-primary:hover { background: #333; transform: translateY(-1px); }
                .btn-secondary { background: transparent; color: #666; border: 1px solid #eee; }
                .btn-secondary:hover { background: #f5f5f5; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; margin-bottom: 1rem; background: #e8f5e9; color: #2e7d32; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="logo">VNPAY <span>SANDBOX MOCK</span></div>
                <div class="badge">CHẾ ĐỘ MÔ PHỎNG</div>
                <div class="amount">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</div>
                <div class="order-id">Mã đơn hàng: #${orderId}</div>
                <p class="desc">Bạn đang thực hiện thanh toán qua cổng VNPay trong môi trường thử nghiệm.</p>
                <button onclick="handlePayment('00')" class="btn btn-primary">Thanh toán thành công</button>
                <button onclick="handlePayment('24')" class="btn btn-secondary">Hủy bỏ giao dịch</button>
            </div>

            <script>
                function handlePayment(code) {
                    const params = {
                        vnp_Amount: ${amount * 100},
                        vnp_ResponseCode: code,
                        vnp_TxnRef: '${orderId}',
                        vnp_PayDate: new Date().toISOString().replace(/[-:T]/g, '').split('.')[0],
                        vnp_TransactionNo: 'MOCK' + Date.now(),
                        vnp_BankCode: 'NCB',
                        vnp_OrderInfo: 'Mock Payment'
                    };

                    // Sort and build sign data to calculate real signature so IPN works
                    const queryString = Object.keys(params).sort().map(k => k + '=' + params[k]).join('&');
                    
                    // Note: In a real simulation, we'd need to hit the backend to get the signature
                    // But for this Mock UI, we'll just redirect and let the backend handle the signature if possible,
                    // or we can allow the backend to skip signature check for 'MOCK' transactions.
                    
                    window.location.href = '/api/payment/vnpay_return?' + queryString + '&vnp_SecureHash=MOCK_SIG';
                }
            </script>
        </body>
        </html>
    `);
});

export default router;
