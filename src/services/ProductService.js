import Product from "../models/Product.js";

class ProductService {
    async getProducts({ pagination, filter }) {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;

        // ... (getProducts remains unchanged for brevity, but we keep the whole block)
        const query = { isArchived: false };

        if (filter) {
            if (filter.category) {
                query.category = filter.category;
            }

            if (filter.search) {
                query.name = { $regex: filter.search, $options: "i" };
            }

            if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
                const priceQuery = {};
                if (filter.minPrice !== undefined) priceQuery.$gte = filter.minPrice;
                if (filter.maxPrice !== undefined) priceQuery.$lte = filter.maxPrice;
                query.variants = { $elemMatch: { price: priceQuery } };
            }
        }

        const skip = (page - 1) * limit;

        const [products, totalItems] = await Promise.all([
            Product.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Product.countDocuments(query)
        ]);

        const mappedProducts = products.map(product => {
            const obj = product.toObject();
            obj.id = obj._id.toString();

            if (obj.variants) {
                obj.variants = obj.variants.map(variant => {
                    variant.id = variant._id.toString();
                    return variant;
                });
            }

            return obj;
        });

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: mappedProducts,
            totalItems,
            totalPages,
            currentPage: page
        };
    }

    async getProductById(id) {
        const product = await Product.findById(id);

        if (!product || product.isArchived) {
            throw new Error("Product not found");
        }

        const obj = product.toObject();
        obj.id = obj._id.toString();

        if (obj.variants) {
            obj.variants = obj.variants.map(variant => {
                variant.id = variant._id.toString();
                return variant;
            });
        }

        return obj;
    }

    async createProduct(input, context) {

        if (!context.user) {
            throw new Error("Unauthorized");
        }

        if (context.user.role !== "ADMIN") {
            throw new Error("Forbidden");
        }

        if (!input.variants || input.variants.length === 0) {
            throw new Error("Product must have at least one variant");
        }

        for (const variant of input.variants) {
            if (variant.price < 0) {
                throw new Error("Price must be greater than or equal to 0");
            }
            if (variant.stock < 0) {
                throw new Error("Stock must be greater than or equal to 0");
            }
        }

        const product = await Product.create({
            ...input,
            createdBy: context.user.id
        });

        const obj = product.toObject();
        obj.id = obj._id.toString();

        if (obj.variants) {
            obj.variants = obj.variants.map(variant => {
                variant.id = variant._id.toString();
                return variant;
            });
        }

        return obj;
    }
}

export default new ProductService();
