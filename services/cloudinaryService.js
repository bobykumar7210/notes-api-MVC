const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

exports.uploadFile = async (file, folder = 'general') => {
    if (!file || !file.buffer) {
        throw new AppError('File is required', 400);
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new AppError('Cloudinary configuration is missing. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.', 500);
    }

    try {
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder },
                (error, uploaded) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(uploaded);
                }
            );

            uploadStream.end(file.buffer);
        });

        return result.secure_url;
    } catch (error) {
        throw new AppError(`Failed to upload file`, 500);
    }
};
