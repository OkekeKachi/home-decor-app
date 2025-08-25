
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();


const createAdmin = async () => {
    connectDB();
    const exists = await User.findOne({ username: "admin" });
    if (exists) {
        console.log("Admin already exists");
        process.exit(0);
    }
    const admin = new User({ username: "admin", password: "StrongPassword123!", role: "admin", email: "admin@gmail.com" });
    
    await admin.save();
    console.log("✅ Admin created:", admin.username);
    process.exit(0);
};

createAdmin();
