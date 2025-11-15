import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLogin: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  failedLoginAttempts: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  isLocked: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user"
  }

});
