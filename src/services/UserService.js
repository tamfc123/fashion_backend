import User from '../models/User.js';
import bcrypt from 'bcrypt';

const UserService = {
    getMe: async (context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized: Login required");
            }

            const user = await User.findById(context.user.id);
            if (!user) {
                throw new Error("User not found");
            }

            return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    updateProfile: async (input, context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized: Login required");
            }

            const user = await User.findById(context.user.id);
            if (!user) {
                throw new Error("User not found");
            }

            user.name = input.name;
            await user.save();

            return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    changePassword: async (input, context) => {
        try {
            if (!context.user) {
                throw new Error("Unauthorized: Login required");
            }

            const user = await User.findById(context.user.id);
            if (!user) {
                throw new Error("User not found");
            }

            const isMatch = await bcrypt.compare(input.oldPassword, user.password);
            if (!isMatch) {
                throw new Error("Invalid current password");
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(input.newPassword, salt);

            user.password = hashedPassword;
            await user.save();

            return "Password updated successfully";
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

export default UserService;
