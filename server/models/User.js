import { Schema, model } from "mongoose";
import { genSalt, hash, compare } from "bcrypt";

const userSchema = new Schema({
    firstName: { type: String, required: false, trim: true },
    lastName: {type: String, required: false, trim: true},
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /^\S+@\S+\.\S+$/ },// simple email validation
    role: { type: String, enum: ["admin", "user"], default: "user" }, // start with admin
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    failedLoginAttempts: { type: Number, default: 0 },
    lastFailedLogin: { type: Date },
    lockUntil: { type: Date },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
}, { timestamps: true });

// Hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
});

// Compare helper
userSchema.methods.matchPassword = function (entered) {
    return compare(entered, this.password);    
};

export default model("User", userSchema);
