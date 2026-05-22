const express = require("express");
const cors = require("cors");

require("dotenv").config();

// ROUTES
const authRoutes = require("./src/routes/auth.routes");
const postRoutes = require("./src/routes/posts.routes");

// DATABASE
require("./src/config/db");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// API ROUTES
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});