require("dotenv").config();
require("./jobs/deleteExpiredPrivileges")
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); 
const mime = require("mime-types");
const fs = require("fs");


// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scanRoutes = require("./routes/scanRoutes");
const eventRoutes = require("./routes/eventRoutes");
const privilegeRoutes = require('./routes/privilegeRoutes');
const phonepeRoutes = require('./routes/phonepeRoutes')

const app = express();
app.use(express.json());

app.get("/uploads/:filename", (req, res) => {
  const filePath = path.resolve("/opt/render/project/src/uploads", req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const mimeType = mime.lookup(filePath);
  res.setHeader("Content-Type", mimeType || "application/octet-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");

  fs.createReadStream(filePath).pipe(res);
});

const corsOptions = {
  origin: ["https://mvp-event.vercel.app", "http://localhost:5173","https://events.aurelionfutureforge.com"],  
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


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
