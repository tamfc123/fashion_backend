import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import VnPayService from './VnPayService.js';

const OrderService = {
    checkout: async (input, context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized");
            }

            const cart = await Cart.findOne({ userId: context.user.id });

            if (!cart || cart.items.length === 0) {
                throw new Error("Cart is empty");
            }

            const orderItems = [];
            let totalAmount = 0;

            for (const item of cart.items) {
                const product = await Product.findById(item.productId);

                if (!product || product.isArchived) {
                    throw new Error("Product not found");
                }

                const variant = product.variants.id(item.variantId);

                if (!variant) {
                    throw new Error("Variant not found");
                }

                if (variant.stock < item.quantity) {
                    throw new Error("Out of stock");
                }

                const price = variant.price !== undefined ? variant.price : product.basePrice;

                orderItems.push({
                    productId: product._id,
                    variantId: variant._id,
                    productName: product.name,
                    size: variant.size,
                    color: variant.color,
                    quantity: item.quantity,
                    priceAtPurchase: price
                });

                totalAmount += item.quantity * price;

                variant.stock -= item.quantity;
                await product.save();
            }

            const order = await Order.create({
                userId: context.user.id,
                shippingAddress: input.shippingAddress,
                phone: input.phone,
                items: orderItems,
                totalAmount,
                status: "PENDING",
                paymentMethod: input.paymentMethod || "COD",
                paymentStatus: "PENDING",
                paymentDetails: {}
            });

            cart.items = [];
            await cart.save();

            let paymentUrl = null;
            if (order.paymentMethod === 'VNPAY') {
                const isPlaceholder = !process.env.VNP_TMN_CODE || process.env.VNP_TMN_CODE === 'HDO2OS3E';
                
                if (isPlaceholder) {
                    // Use Professional Mock Gateway for local development
                    paymentUrl = `http://localhost:5005/api/payment/mock-vnpay?orderId=${order._id}&amount=${order.totalAmount}`;
                } else {
                    const ipAddr = context.req ? (context.req.headers['x-forwarded-for'] || context.req.connection.remoteAddress) : '127.0.0.1';
                    paymentUrl = VnPayService.createPaymentUrl(order._id.toString(), order.totalAmount, ipAddr, `Thanh toan don hang ${order._id}`);
                }
            }

            return {
                id: order._id.toString(),
                userId: order.userId.toString(),
                shippingAddress: order.shippingAddress,
                phone: order.phone,
                items: order.items.map(i => ({
                    productId: i.productId.toString(),
                    variantId: i.variantId.toString(),
                    productName: i.productName,
                    size: i.size,
                    color: i.color,
                    quantity: i.quantity,
                    priceAtPurchase: i.priceAtPurchase
                })),
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                paymentUrl: paymentUrl,
                createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
                updatedAt: order.updatedAt ? order.updatedAt.toISOString() : new Date().toISOString()
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    mockPayOrder: async (orderId, context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized");
            }

            const order = await Order.findById(orderId);

            if (!order) {
                throw new Error("Order not found");
            }

            if (order.userId.toString() !== context.user.id) {
                throw new Error("Unauthorized access to this order");
            }

            if (order.status !== "PENDING") {
                throw new Error("Order is not in pending status");
            }

            order.status = "PAID";
            await order.save();

            return {
                id: order._id.toString(),
                userId: order.userId.toString(),
                shippingAddress: order.shippingAddress,
                phone: order.phone,
                items: order.items.map(i => ({
                    productId: i.productId.toString(),
                    variantId: i.variantId.toString(),
                    productName: i.productName,
                    size: i.size,
                    color: i.color,
                    quantity: i.quantity,
                    priceAtPurchase: i.priceAtPurchase
                })),
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                paymentUrl: null,
                createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
                updatedAt: order.updatedAt ? order.updatedAt.toISOString() : new Date().toISOString()
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async getOrders(userId) {
        try {
            const orders = await Order.find({ userId }).sort({ createdAt: -1 });
            return orders.map(order => ({
                id: order._id.toString(),
                userId: order.userId.toString(),
                shippingAddress: order.shippingAddress,
                phone: order.phone,
                items: order.items.map(i => ({
                    productId: i.productId.toString(),
                    variantId: i.variantId.toString(),
                    productName: i.productName,
                    size: i.size,
                    color: i.color,
                    quantity: i.quantity,
                    priceAtPurchase: i.priceAtPurchase
                })),
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                paymentUrl: order.paymentUrl,
                createdAt: order.createdAt ? order.createdAt.toISOString() : null,
                updatedAt: order.updatedAt ? order.updatedAt.toISOString() : null
            }));
        } catch (error) {
            throw new Error(error.message);
        }
    },

    getMyOrders: async (args, context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized");
            }

            const page = args.pagination?.page || 1;
            const limit = args.pagination?.limit || 10;
            const skip = (page - 1) * limit;

            const orders = await Order.find({ userId: context.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalItems = await Order.countDocuments({ userId: context.user.id });
            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: orders.map(order => ({
                    id: order._id.toString(),
                    userId: order.userId.toString(),
                    shippingAddress: order.shippingAddress,
                    phone: order.phone,
                    items: order.items.map(i => ({
                        productId: i.productId.toString(),
                        variantId: i.variantId.toString(),
                        productName: i.productName,
                        size: i.size,
                        color: i.color,
                        quantity: i.quantity,
                        priceAtPurchase: i.priceAtPurchase
                    })),
                    totalAmount: order.totalAmount,
                    status: order.status,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus,
                    paymentUrl: null,
                    createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
                    updatedAt: order.updatedAt ? order.updatedAt.toISOString() : new Date().toISOString()
                })),
                totalItems,
                totalPages,
                currentPage: page
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

export default OrderService;
