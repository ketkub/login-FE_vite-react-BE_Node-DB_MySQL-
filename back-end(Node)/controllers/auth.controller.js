import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sequelize } from "../config/db.config.js";
import { User } from "../models/user.model.js";
import { PasswordReset } from "../models/reset-password.model.js";
import { VerifyEmail } from "../models/verify-email.model.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "ketwowwow@gmail.com",
                pass: "sjtj ywol sgno prwv"
            }
        });

export const register = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, username, password: hashedPassword, isVerified: false });

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24*60*60*1000);
        await VerifyEmail.create({ userId: newUser.id, token , expiresAt })
        const verifyURL = `http://localhost:5000/api/verify?token=${token}`;

        await transporter.sendMail({
            from: ` <ketnadech@gmail.com>`,
            to: email,
            subject: "Verify your email",
            html: `
        <h2>Welcome!</h2>
        <p>Click the link below to verify your email</p>
        <a href="${verifyURL}">${verifyURL}</a>
      `
        });

        res.status(200).json({ message: "Register success, please check your email for verification", User:newUser.username});

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error registering user" });
    }
};

export const verifybyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token required" });

    const entry = await VerifyEmail.findOne({ where: { token, used: false } });
    if (!entry || entry.expiresAt < new Date()) return res.status(400).json({ message: "Invalid or expired token" });

    const user = await User.findByPk(entry.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    await user.save();

    entry.used = true;
    await entry.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying email", error: err.message });
  }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= 5) user.isLocked = true;
            await user.save();
            return res.status(401).json({ message: "Invalid password" });
        }
        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email before login" });
        }
        if (user.isLocked) {
            return res.status(403).json({ message: "Account is locked. Contact support." });
        }
        user.lastLogin = new Date();
            await user.save();
        const token = jwt.sign({ userId: user.id }, "Test_Key", { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message })
    };
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15*60*1000); 
    await PasswordReset.create({ userId: user.id, token, expiresAt });

    const resetURL = `http://localhost:5000/api/reset-password?token=${token}`;
    await transporter.sendMail({
      from: ` <ketnadech@gmail.com>`,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click below to reset your password:</p><a href="${resetURL}">${resetURL}</a>`
    });

    res.status(200).json({ message: "Reset password link sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending reset password email", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const entry = await PasswordReset.findOne({ where: { token, used: false } });
    if (!entry || entry.expiresAt < new Date()) return res.status(400).json({ message: "Invalid or expired token" });

    const decoded = jwt.verify(token, "Test_Key");

    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    entry.used = true;
    await entry.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    console.error("Verify Email Error:", err.name, err.message);
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};