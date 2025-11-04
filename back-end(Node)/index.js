import express from "express";
import cors from "cors";
import { sequelize } from "./config/db.config.js";
import authRoutes from "./routes/auth.routes.js";
import crudProductRoutes from "./routes/crudproduct.route.js";
import profileuser from "./routes/profileuser.routes.js";
import picprofile from "./routes/picprofile.routes.js";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth/", authRoutes);
app.use("/api/", crudProductRoutes, profileuser);
app.use("/api/", picprofile);
app.use("/uploads", express.static("uploads"));


sequelize.sync({ alter: true }).then(() => console.log("Database synced"));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
