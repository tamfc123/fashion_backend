import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: 'USER',
        },
        phone: {
            type: String,
            default: '',
        },
        street: {
            type: String,
            default: '',
        },
        district: {
            type: String,
            default: '',
        },
        city: {
            type: String,
            default: '',
        },
        wishlist: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('User', userSchema);
