import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { apiRateLimiter, authRateLimiter, newsletterRateLimiter } from "./middlewares/rateLimit.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth/auth.routes.js";
import userRoutes from "./routes/auth/user.routes.js"
import sessionRoutes from "./routes/auth/session.routes.js";

import newsletterRoutes from "./routes/newsletter.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import mediaRoutes from "./routes/media.routes.js"

dotenv.config();

const app = express();


app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",

    ],
  credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true, limit: "3mb" }));


app.use("/api", apiRateLimiter);

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/user", authRateLimiter, userRoutes);
app.use("/api/session", authRateLimiter, sessionRoutes);

app.use("/api/newsletter", newsletterRateLimiter, newsletterRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/media",  mediaRoutes)

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Backend Running Successfully",
    runtime_seconds: Math.floor(process.uptime()),
    current_time: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
  });
});
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
