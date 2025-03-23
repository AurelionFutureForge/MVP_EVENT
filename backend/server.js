require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scanRoutes = require("./routes/scanRoutes");

const app = express();
app.use(express.json());

const corsOptions = {
  origin: ["https://mvp-event.vercel.app","http://localhost:5173"],  
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,    
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/admin", authRoutes);
app.use("/users", userRoutes);
app.use("/scan", scanRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
