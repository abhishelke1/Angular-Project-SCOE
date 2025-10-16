import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔹 Replace with your actual password
mongoose.connect("mongodb+srv://abhishelke42161_db_user:Abhishek123@cluster.5epaayx.mongodb.net/LoginDB?retryWrites=true&w=majority&appName=Cluster")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// 🔹 User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", UserSchema);

// 🔹 Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const user = new User({ name, email, password });
    await user.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error registering user" });
  }
});

// 🔹 Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({ success: true, message: "Login successful", user });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Error logging in" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
