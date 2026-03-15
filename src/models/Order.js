import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        shippingAddress: String,
        phone: String,
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                variantId: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                productName: String,
                size: String,
                color: String,
                quantity: Number,
                priceAtPurchase: Number,
            },
        ],
        totalAmount: Number,
        status: {
            type: String,
            enum: ['PENDING', 'PAID', 'CANCELLED'],
            default: 'PENDING',
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'VNPAY'],
            default: 'COD',
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
            default: 'PENDING',
        },
        paymentDetails: {
            type: Object,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Order', OrderSchema);
