import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

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
                items: orderItems,
                totalAmount,
                status: "PENDING"
            });

            cart.items = [];
            await cart.save();

            return {
                id: order._id.toString(),
                userId: order.userId.toString(),
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
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
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
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            };
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
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
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
