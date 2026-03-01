import bcrypt from "bcryptjs";
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const AuthService = {
    register: async ({ name, email, password }) => {
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email already in use');
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
            throw new Error(error.message);
        }
    },

    login: async ({ email, password }) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
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
            throw new Error(error.message);
        }
    }
};

export default AuthService;
