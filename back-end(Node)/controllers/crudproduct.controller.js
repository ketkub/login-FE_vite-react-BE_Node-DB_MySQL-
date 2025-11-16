import { Product } from "../models/product.model.js";
import multer from "multer";
import path from "path";

// Multer setup สำหรับ product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, "product-" + Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"), false);
  }
  cb(null, true);
};

export const uploadProductImage = multer({ storage, fileFilter });

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, brand, InStock } = req.body;
        
        // ใช้ชื่อไฟล์จากการ upload ถ้ามี ไม่ใช่จาก body
        const image = req.file ? `/uploads/${req.file.filename}` : null;
        
        if (!image) {
            return res.status(400).json({ message: "Image is required" });
        }
        
        const newProduct = await Product.create({ 
            name, 
            description, 
            price, 
            image,  // ใช้ path ที่อัพโหลดได้
            category, 
            brand, 
            InStock 
        });
        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        res.status(400).json({ message: "Error creating product", error: error.message });
    }
};

export const getallProducts = async (req, res) => {
    try{
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;
        const {count, rows} = await Product.findAndCountAll({
            limit,
            offset,
            order:[["id","ASC"]]
        });
        res.json({
            totalItems: {
                products: rows,
                count,
            },
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        })
    } catch (error){
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) 
        {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }            
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, brand, InStock} = req.body;
        const product = await Product.findByPk(id);
        if (!product) 
        {
            return res.status(404).json({ message: "Product not found" });
        }
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        // หากมีการอัพโหลดรูปภาพใหม่ ให้อัปเดต image
        if (req.file) {
            product.image = `/uploads/${req.file.filename}`;
        }
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.InStock = InStock || product.InStock;
        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(400).json({ message: "Error updating product", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id); 
        if (!product) 
        {
            return res.status(404).json({ message: "Product not found" });
        }   
        await product.destroy();
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};