import express from "express"
const router = express.Router();
import User from "../models/User.js"
import { protect }from '../middleware/authMiddleware.js'



router.get("/all", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "Error fetching users" });
    }
});
router.get('/profile', protect, (req, res) => {
    res.json({ message: `Hello, ${req.user.username}` });
});

export default router;

// import express from "express";
// import { upload } from "../config/cloudinary.js";

// const router = express.Router();

// router.post("/upload", upload.single("image"), (req, res) => {
//     try {
//         // console.log(req.file.path); // Log the uploaded file info
        
//         res.json({ imageUrl: req.file.path });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// export default router;
