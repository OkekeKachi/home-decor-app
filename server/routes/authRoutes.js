import express from "express"
const router = express.Router();
import { login, registerUser, verifyEmail, resendVerification, checkVerification, forgotPassword, resetPassword} from '../controllers/authController.js'
import { body } from "express-validator";
import validateRequest from "../middleware/validateRequest.js"

router.post(
  "/login",
  [
    body("email").notEmpty().withMessage("email required"),
    body("password").notEmpty().withMessage("password required"),
  ],
  validateRequest,
  login
);

router.post('/register', registerUser);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/check-verification", checkVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


export default router;
