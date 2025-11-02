import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("shop", "postgres", "1234", {
  host: "localhost",
  port: "7777",
  dialect: "postgres",
});
