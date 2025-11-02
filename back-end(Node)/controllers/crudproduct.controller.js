import { Product } from "../models/product.model.js";

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category, brand, InStock} = req.body;
        const newProduct = await Product.create({ name, description, price, image, category, brand, InStock });
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
        const { name, description, price, image, category, brand, InStock} = req.body;
        const product = await Product.findByPk(id);
        if (!product) 
        {
            return res.status(404).json({ message: "Product not found" });
        }
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.image = image || product.image;
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