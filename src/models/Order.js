import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
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
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Order', OrderSchema);
