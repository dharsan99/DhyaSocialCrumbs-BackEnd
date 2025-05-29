const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const authRoutes = require("./routes/auth.routes");
const socialRoutes = require("./routes/social.routes");
const clientRoutes = require("./routes/client.routes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ CORS with credentials
app.use(
  cors({
    origin: [
      "http://localhost:5173",                      // dev
      "https://dhya-social-crumbs-frontend.vercel.app" // prod
    ], // ✅ Explicitly allow your frontend origin
    credentials: true,
  })
);

app.use(express.json());

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/clients", clientRoutes);

// Test routes
app.get("/", (req, res) => res.send("Dhya Social Crumbs Backend ✅"));
app.get("/test", (req, res) => res.send("Test route is working!"));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger docs at http://localhost:${PORT}/api/docs`);
});