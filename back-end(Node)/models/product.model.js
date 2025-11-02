import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

export const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  InStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
