import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL'],
        required: true
    },
    color: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        enum: ['SHIRT', 'PANTS', 'HOODIE', 'DRESS', 'JACKET'],
        required: true
    },
    images: [{
        type: String
    }],
    variants: [variantSchema],
    isArchived: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;
