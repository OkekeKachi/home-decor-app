import express from "express"
const router = express.Router();
import { login } from "../controllers/authController.js";
import { registerUser } from '../controllers/authController.js'
import { body } from "express-validator";
import validateRequest from "../middleware/validateRequest.js"

router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("username required"),
    body("password").notEmpty().withMessage("password required"),
  ],
  validateRequest,
  login
);

router.post('/register', registerUser);

export default router;
