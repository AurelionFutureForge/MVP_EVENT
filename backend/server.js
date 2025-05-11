require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scanRoutes = require("./routes/scanRoutes");
const eventRoutes = require("./routes/eventRoutes");
const privilegeRoutes = require('./routes/privilegeRoutes');

const app = express();
app.use(express.json());

// CORS config (NO credentials needed since we're using headers for JWT)
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
app.use('/privilege',privilegeRoutes);

// Connect DB + start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
