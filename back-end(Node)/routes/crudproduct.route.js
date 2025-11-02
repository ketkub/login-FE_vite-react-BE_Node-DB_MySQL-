import { createProduct, deleteProduct, getallProducts, getProductById, updateProduct } from "../controllers/crudproduct.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from "express";

const router = express.Router();

router.post("/products", createProduct, verifyToken);
router.get("/products", getallProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", updateProduct, verifyToken);
router.delete("/products/:id", deleteProduct, verifyToken);

export default router;