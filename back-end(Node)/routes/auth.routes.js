import express from "express";
import { register, login, verifybyEmail, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const routes = express.Router();

routes.post("/register", register);
routes.get("/verify", verifybyEmail);
routes.post("/login", login);
routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password", resetPassword);


routes.get("/profile", verifyToken, (req, res) => {
  res.json({ message: `Welcome user ${  req.userId}` });
});

export default routes;