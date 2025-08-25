import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer"
import dotenv from "dotenv";
 
dotenv.config()

if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("❌ Missing Cloudinary environment variables. Please check your .env file.");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "❌ Not set");
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ Not set");
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ Not set");

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: "homedecor_products",
            allowed_formats: ["jpg", "jpeg", "png"]
        };
    },
});

const upload = multer({ storage });

export { cloudinary, upload };
