import AuthService from "../services/AuthService.js";
import UserService from "../services/UserService.js";

const resolvers = {
    Query: {
        getMe: async (_, __, context) => {
            return UserService.getMe(context);
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
        }
    },
};

export default resolvers;