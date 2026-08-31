import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password"); // no password in req.user
            console.log(req.user);
            
            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }

            next();
        } catch (err) {
            console.error("AUTH ERROR NAME:", err.name);
            console.error("AUTH ERROR MESSAGE:", err.message);
            return res.status(401).json({
                message: "Not authorized, token failed",
                error: err.message
            });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
}

export function adminOnly(req, res, next) {
    
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Admin access only" });
    }
}
