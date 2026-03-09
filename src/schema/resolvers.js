import AuthService from "../services/AuthService.js";
import UserService from "../services/UserService.js";
import ProductService from "../services/ProductService.js";
import CartService from "../services/CartService.js";
import OrderService from "../services/OrderService.js";

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
        checkout: async (_, { input }, context) => {
            return OrderService.checkout(input, context);
        },
        mockPayOrder: async (_, { orderId }, context) => {
            return OrderService.mockPayOrder(orderId, context);
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