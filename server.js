require('dotenv').config();  
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public")); // Serve static files

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected..."))
.catch(err => console.error("MongoDB connection error:", err));

// Models
const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String,
}));

const Feedback = mongoose.model("Feedback", new mongoose.Schema({
  name: String,
  message: String,
}));

// Root Route (Default Page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "feedback.html"));
});

// Register Route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "Email already registered." });

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashedPassword });
  res.json({ message: "Registration successful!" });
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    res.json({ message: "Login successful!" });
  } else {
    res.status(401).json({ message: "Invalid email or password." });
  }
});

// Submit Feedback Route
app.post("/submit", async (req, res) => {
  await Feedback.create(req.body);
  res.json({ message: "Feedback submitted!" });
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

