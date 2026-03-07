import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const AuthService = {
    register: async ({ name, email, password }) => {
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new GraphQLError('Email already in use', {
                    extensions: { code: 'BAD_USER_INPUT' }
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
            });

            const token = generateToken(user._id);

            return {
                token,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            };
        } catch (error) {
            if (error instanceof GraphQLError) throw error;
            throw new GraphQLError(error.message, {
                extensions: { code: 'INTERNAL_SERVER_ERROR' }
            });
        }
    },

    login: async ({ email, password }) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: { code: 'UNAUTHENTICATED' }
                });
            }

            const token = generateToken(user._id);

            return {
                token,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            };
        } catch (error) {
            if (error instanceof GraphQLError) throw error;
            throw new GraphQLError(error.message, {
                extensions: { code: 'INTERNAL_SERVER_ERROR' }
            });
        }
    }
};

export default AuthService;
