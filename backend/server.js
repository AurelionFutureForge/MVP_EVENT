require("dotenv").config();
require("./jobs/deleteExpiredPrivileges");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scanRoutes = require("./routes/scanRoutes");
const eventRoutes = require("./routes/eventRoutes");
const privilegeRoutes = require("./routes/privilegeRoutes");
const phonepeRoutes = require("./routes/phonepeRoutes");

const app = express();
app.use(express.json());

// CORS options
const corsOptions = {
  origin: [
    "http://localhost:5173/stagyn",
    "https://www.aurelionfutureforge.com/stagyn/",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Define uploads directory relative to project root
const uploadDir = path.join(__dirname, "uploads");

// Serve uploaded files statically with CORS headers
app.use(
  "/uploads",
  express.static(uploadDir, {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.get("/",(req,res)=>{
  res.send("stagyn.io APIs Working")
})

// Routes
app.use("/admin", authRoutes);
app.use("/users", userRoutes);
app.use("/scan", scanRoutes);
app.use("/events", eventRoutes);
app.use("/privilege", privilegeRoutes);
app.use("/api/phonepe", phonepeRoutes);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
