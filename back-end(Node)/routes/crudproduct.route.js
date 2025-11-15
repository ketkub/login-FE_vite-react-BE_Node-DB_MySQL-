import { createProduct, deleteProduct, getallProducts, getProductById, updateProduct, uploadProductImage } from "../controllers/crudproduct.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import express from "express";

const router = express.Router();

router.post("/products", verifyAdmin, uploadProductImage.single("image"), createProduct);
router.get("/products", getallProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", verifyAdmin, updateProduct);
router.delete("/products/:id", verifyAdmin, deleteProduct);

export default router;