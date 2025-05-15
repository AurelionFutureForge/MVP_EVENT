require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // ✅ Required to resolve paths


// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scanRoutes = require("./routes/scanRoutes");
const eventRoutes = require("./routes/eventRoutes");
const privilegeRoutes = require('./routes/privilegeRoutes');
const phonepeRoutes = require('./routes/phonepeRoutes')

const app = express();
app.use(express.json());

app.use('/uploads', express.static(path.resolve('/opt/render/project/src/uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Optional but useful: Ensure correct MIME type (especially helpful with older or misconfigured setups)
    if (filePath.endsWith('.jpg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// CORS config
const corsOptions = {
  origin: ["https://mvp-event.vercel.app", "http://localhost:5173"],  
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Routes
app.use("/admin", authRoutes);
app.use("/users", userRoutes);
app.use("/scan", scanRoutes);
app.use("/events", eventRoutes);
app.use("/privilege", privilegeRoutes);
app.use('/api/phonepe', phonepeRoutes);

// Connect DB + start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
