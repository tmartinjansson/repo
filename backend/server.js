// backend/server.js

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://repo-ten-alpha.vercel.app",
    "https://repo-git-master-martin-janssons-projects.vercel.app",
    "https://repo-5gx9i5zf4-martin-janssons-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());


// Routes
app.use("/api/companies", require("./routes/companies"));
app.use("/api/employees", require("./routes/employees"));

// Basic route for testing
app.get("/", (req, res) => {
  res.send("API is running");
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});