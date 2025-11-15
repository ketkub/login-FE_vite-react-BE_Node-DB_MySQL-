import { Cart } from "../models/cart.model.js";
import { CartItem } from "../models/cart-item.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/order-item.model.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // หา cart ของ user (เฉพาะที่ยังเป็น pending) ถ้าไม่มีให้สร้างใหม่
    let cart = await Cart.findOne({ where: { userid: userId, status: "pending" } });
    if (!cart) cart = await Cart.create({ userid: userId, status: "pending" });

    // แปลง quantity ให้เป็นตัวเลข และตั้งค่าเริ่มต้นเป็น 1
    const qty = Number(quantity) && Number(quantity) > 0 ? Number(quantity) : 1;

    // เพิ่มสินค้า
    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity) + qty;
      await existingItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: qty,
      });
    }

    // ส่ง cart อัปเดตกลับไป (รวม items) เพื่อให้ frontend สามารถรีเฟรชสถานะได้
    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [{ model: CartItem, as: "items", include: [{ model: Product, as: "Product" }] }]
    });

    res.json({ message: "Added to cart", cart: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({
      where: { userid: userId, status: "pending" },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: [
                "id",
                "name",
                "price",
              ],
            },
          ],
        },
      ],
    });

    if (!cart) return res.json({ cart: { items: [] }, totalPrice: 0 });

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.Product.price, // <-- 3. แก้ไขการคำนวณให้ตรง Alias
      0
    );

    res.json({ cart, totalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeCartItemById = async (req, res) => {
  try {
    const userId = req.userId; // มาจาก middleware
    const { id } = req.params; // id ของ CartItem

    // หา CartItem และตรวจสอบว่าอยู่ใน cart ของ user
    const item = await CartItem.findOne({
      where: { id }, // ⚡ CartItem.id
      include: [
        {
          model: Cart,
          where: { userid: userId, status: "pending" },
        },
      ],
    });

    if (!item)
      return res
        .status(404)
        .json({ message: "CartItem not found or not in your cart" });

    // ลบ CartItem.id
    await item.destroy();

    res.json({ message: `CartItem id ${id} removed` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const removeallFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ where: { userid: userId, status: "pending" } });
    if (!cart) return res.status(400).json({ message: "Cart not found" });
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ message: "All items removed from cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItemId, newQuantity } = req.body;

    // ตรวจสอบ newQuantity
    if (typeof newQuantity !== "number" || newQuantity <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid quantity. Must be greater than 0." });
    }

    // หา cart ของ user
    const cart = await Cart.findOne({
      where: { userid: userId, status: "pending" },
    });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // หา CartItem ตาม id ของ CartItem และ cartId
    const item = await CartItem.findOne({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    // อัปเดต quantity
    item.quantity = newQuantity;
    await item.save();

    res.json({ message: "Quantity updated successfully", updatedItem: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const checkout = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({
      where: { userid: userId, status: "pending" },
      include: [{ model: CartItem, as: "items", include: [{ model: Product, as: "Product" }] }]
    });

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart empty" });

    const totalPrice = cart.items.reduce((sum, item) => {
      const price = item.Product?.price || 0;
      return sum + item.quantity * Number(price);
    }, 0);

    const order = await Order.create({ userid: userId, totalPrice });

    for (const item of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: Number(item.Product?.price || 0)
      });

      // ลด InStock ของสินค้า
      const product = item.Product;
      if (product) {
        const newStock = Math.max(0, (product.InStock || 0) - item.quantity);
        await product.update({ InStock: newStock });
      }
    }

    cart.status = "completed";
    await cart.save();

    res.json({ message: "Checkout success", orderId: order.id });
  } catch (error) {
    console.error("Checkout failed:", error);
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
};


export const getOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.findAll({
      where: { userid: userId }, // ✅ ใช้ 'userid' ตามโค้ดเดิมของคุณ
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            // include Product so frontend can show product details
            { model: Product, as: "Product", attributes: ["id", "name", "price", "image", "brand"] }
          ]
        }
      ]
    });
    res.json(orders);
  } catch (error) {
    console.error("Failed to get orders:", error);
    res.status(500).json({ error: "Failed to retrieve orders." });
  }
};

// Admin endpoint: get ALL orders from all users
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            { model: Product, as: "Product", attributes: ["id", "name", "price", "image", "brand"] }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(orders);
  } catch (error) {
    console.error("Failed to get all orders:", error);
    res.status(500).json({ error: "Failed to retrieve orders." });
  }
};
