import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("login", "postgres", "1234", {
  host: "localhost",
  port: "5432",
  dialect: "postgres",
});
