import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer (from Multer) to Cloudinary
 * @param {Buffer} buffer - The file buffer
 * @returns {Promise<string>} The Cloudinary secure_url
 */
export const uploadBufferToCloudinary = async (buffer) => {
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

        // End the stream with the buffer
        stream.end(buffer);
    });
};
