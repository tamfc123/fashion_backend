import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const CartService = {
    getMyCart: async (context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized");
            }

            const cart = await Cart.findOne({ userId: context.user.id });

            if (!cart) {
                return {
                    id: null,
                    userId: context.user.id,
                    items: []
                };
            }

            return {
                id: cart._id.toString(),
                userId: cart.userId.toString(),
                items: cart.items.map(item => ({
                    productId: item.productId.toString(),
                    variantId: item.variantId.toString(),
                    quantity: item.quantity
                })),
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    addToCart: async (input, context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized");
            }

            const { productId, variantId, quantity } = input;

            const product = await Product.findById(productId);

            if (!product || product.isArchived) {
                throw new Error("Product not found");
            }

            const variant = product.variants.id(variantId);

            if (!variant) {
                throw new Error("Variant not found");
            }

            if (variant.stock < quantity) {
                throw new Error("Out of stock");
            }

            let cart = await Cart.findOne({ userId: context.user.id });

            if (!cart) {
                cart = await Cart.create({
                    userId: context.user.id,
                    items: []
                });
            }

            const existingItem = cart.items.find(
                item => item.productId.toString() === productId && item.variantId.toString() === variantId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({
                    productId,
                    variantId,
                    quantity
                });
            }

            await cart.save();

            return {
                id: cart._id.toString(),
                userId: cart.userId.toString(),
                items: cart.items.map(item => ({
                    productId: item.productId.toString(),
                    variantId: item.variantId.toString(),
                    quantity: item.quantity
                })),
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    updateCartItemQuantity: async (input, context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized");
            }

            const { productId, variantId, quantity } = input;

            const cart = await Cart.findOne({ userId: context.user.id });

            if (!cart) {
                throw new Error("Cart not found");
            }

            const item = cart.items.find(
                i => i.productId.toString() === productId && i.variantId.toString() === variantId
            );

            if (!item) {
                throw new Error("Item not found in cart");
            }

            if (quantity <= 0) {
                cart.items = cart.items.filter(
                    i => !(i.productId.toString() === productId && i.variantId.toString() === variantId)
                );
            } else {
                item.quantity = quantity;
            }

            await cart.save();

            return {
                id: cart._id.toString(),
                userId: cart.userId.toString(),
                items: cart.items.map(cartItem => ({
                    productId: cartItem.productId.toString(),
                    variantId: cartItem.variantId.toString(),
                    quantity: cartItem.quantity
                })),
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    removeFromCart: async (productId, variantId, context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized");
            }

            const cart = await Cart.findOne({ userId: context.user.id });

            if (!cart) {
                throw new Error("Cart not found"); // Fallback if no cart exists
            }

            cart.items = cart.items.filter(
                i => !(i.productId.toString() === productId && i.variantId.toString() === variantId)
            );

            await cart.save();

            return {
                id: cart._id.toString(),
                userId: cart.userId.toString(),
                items: cart.items.map(item => ({
                    productId: item.productId.toString(),
                    variantId: item.variantId.toString(),
                    quantity: item.quantity
                })),
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

export default CartService;
