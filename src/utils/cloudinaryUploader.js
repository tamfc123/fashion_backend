import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a GraphQL Upload File Stream to Cloudinary buffer
 * @param {Promise} file - The file Promise from GraphQLUpload (graphql-upload-minimal)
 * @returns {Promise<string>} The Cloudinary secure_url
 */
export const uploadStreamToCloudinary = async (file) => {
    const { createReadStream } = await file;

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "fashion_app_products" },
            (error, result) => {
                if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(error);
                }
            }
        );

        createReadStream().pipe(stream);
    });
};
