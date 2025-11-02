import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

export const VerifyEmail = sequelize.define("VerifyEmail", {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
},
  token: { 
    type: DataTypes.STRING, 
    allowNull: false 
},
  expiresAt: { 
    type: DataTypes.DATE, 
    allowNull: false 
},
  used: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false
}

});