import AuthService from "../services/AuthService.js";
import UserService from "../services/UserService.js";
import ProductService from "../services/ProductService.js";
import CartService from "../services/CartService.js";
import OrderService from "../services/OrderService.js";
import WishlistService from "../services/WishlistService.js";

const resolvers = {

    Query: {
        getMe: async (_, __, context) => {
            return UserService.getMe(context);
        },
        getProducts: async (_, args) => {
            return ProductService.getProducts(args);
        },
        getProductById: async (_, { id }) => {
            return ProductService.getProductById(id);
        },
        getMyCart: async (_, __, context) => {
            return CartService.getMyCart(context);
        },
        getMyOrders: async (_, args, context) => {
            return OrderService.getMyOrders(args, context);
        },
        getOrders: async (_, __, context) => {
            if (!context.user) throw new Error('Unauthorized');
            return OrderService.getOrders(context.user.id);
        },
        getWishlist: async (_, __, context) => {
            return WishlistService.getWishlist(context);
        }
    },
    Mutation: {
        register: async (_, { input }) => {
            return AuthService.register(input);
        },
        login: async (_, { input }) => {
            return AuthService.login(input);
        },
        updateProfile: async (_, { input }, context) => {
            return UserService.updateProfile(input, context);
        },
        changePassword: async (_, { input }, context) => {
            return UserService.changePassword(input, context);
        },
        createProduct: async (_, { input }, context) => {
            return ProductService.createProduct(input, context);
        },
        addToCart: async (_, { input }, context) => {
            return CartService.addToCart(input, context);
        },
        updateCartItemQuantity: async (_, { input }, context) => {
            return CartService.updateCartItemQuantity(input, context);
        },
        removeFromCart: async (_, { productId, variantId }, context) => {
            return CartService.removeFromCart(productId, variantId, context);
        },
        checkout: async (_, { input }, context) => {
            return OrderService.checkout(input, context);
        },
        mockPayOrder: async (_, { orderId }, context) => {
            return OrderService.mockPayOrder(orderId, context);
        },
        toggleWishlist: async (_, { productId }, context) => {
            return WishlistService.toggleWishlist(productId, context);
        }
    },
    CartItem: {
        product: async (parent) => {
            return ProductService.getProductById(parent.productId);
        },
        variant: async (parent) => {
            const product = await ProductService.getProductById(parent.productId);
            return product.variants.find(v => v.id === parent.variantId);
        }
    }
};

export default resolvers;