import app from "./app.js";
import { prisma } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected Successfully (Neon + Prisma)");

    /* Start server */
    app.listen(PORT, () => {
      console.log("====================================");
      console.log(`🚀 Server Running on PORT: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`⏱ Runtime Start: ${new Date().toISOString()}`);
      console.log("📦 Tables Managed via Prisma Migration System");
      console.log("====================================");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();