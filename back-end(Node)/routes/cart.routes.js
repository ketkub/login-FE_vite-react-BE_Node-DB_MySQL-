import express from "express";
import { addToCart, getCart, checkout, getOrders, removeallFromCart, updateCartItemQuantity, removeCartItemById } from "../controllers/cart.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/cart/add", verifyToken, addToCart);
router.get("/cart", verifyToken, getCart);
router.post("/cart/checkout", verifyToken, checkout);
router.get("/orders", verifyToken, getOrders);
router.delete("/cart/removeall", verifyToken, removeallFromCart);
router.put("/cart/update", verifyToken, updateCartItemQuantity);
router.delete("/cart/item/:id", verifyToken, removeCartItemById);

export default router;
