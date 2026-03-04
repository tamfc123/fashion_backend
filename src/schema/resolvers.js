import AuthService from "../services/AuthService.js";
import UserService from "../services/UserService.js";
import ProductService from "../services/ProductService.js";

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
        }
    },
};

export default resolvers;