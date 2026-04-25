import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

let isCloudinaryConfigured = false;

const ensureCloudinaryConfig = () => {
    if (isCloudinaryConfigured) return;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    isCloudinaryConfigured = true;
};

const uploadToCloudinary = async (fileBuffer: Buffer, fileName: string, folder: string = 'knowledge-base'): Promise<string | null> => {
    ensureCloudinaryConfig();

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
                public_id: fileName.replace(/\.[^/.]+$/, ''),
            },
            (error: any, result: any) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(null);
                } else {
                    console.log('Successfully uploaded to Cloudinary:', result?.secure_url);
                    resolve(result?.secure_url || null);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

const processImageUploads = async (files: Express.Multer.File[], folder: string = 'startshop/products'): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    
    const uploadPromises = files.map(async (file) => {
        const url = await uploadToCloudinary(file.buffer, file.originalname, folder);
        if (!url) throw new Error("Upload failed");
        return url;
    });

    return await Promise.all(uploadPromises);
};

const upload = multer({ storage: multer.memoryStorage() });

export { uploadToCloudinary, processImageUploads, upload };
