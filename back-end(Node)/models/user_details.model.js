import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";
import { User } from "./user.model.js";

export const UserDetails = sequelize.define("UserDetails", {
  firstname: {
    type: DataTypes.STRING,
  },
  lastnname:{
    type: DataTypes.STRING,    
  },
  gender: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  birthDate: {
    type: DataTypes.DATE,
  },
});

User.hasOne(UserDetails, {
  foreignKey: "userid",
  as: "details",
  onDelete: "CASCADE",
});

UserDetails.belongsTo(User, {
  foreignKey: "userid",
  as: "user",
});
