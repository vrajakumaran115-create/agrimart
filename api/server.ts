import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { setupRoutes } from "../server/routes.ts";

const app = express();
const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

app.use(cors());
app.use(express.json());

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "production" });
});

setupRoutes(app);

export default app;
