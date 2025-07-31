const express = require("express");
const router = express.Router();
const User = require("./../models/User");
const bcrypt = require("bcrypt");

// POST /user/signup
router.post("/signup", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ status: "FAILED", message: "Request body missing" });
    }

    let { name = "", email = "", password = "", dateOfBirth = "" } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    if (!name || !email || !password || !dateOfBirth) {
      return res.status(400).json({ status: "FAILED", message: "Empty input fields!" });
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return res.status(400).json({ status: "FAILED", message: "Invalid name entered" });
    }
    if (!/^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ status: "FAILED", message: "Invalid email entered" });
    }
    // Expect format "YYYY-MM-DD"
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) || !new Date(dateOfBirth).getTime()) {
      return res.status(400).json({ status: "FAILED", message: "Invalid date of birth; use YYYY-MM-DD" });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: "FAILED", message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ status: "FAILED", message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed, dateOfBirth });
    const saved = await newUser.save();

    return res.status(201).json({
      status: "SUCCESS",
      message: "Signup successful!",
      data: { id: saved._id, name: saved.name, email: saved.email, dateOfBirth: saved.dateOfBirth },
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ status: "FAILED", message: "Internal server error" });
  }
});

module.exports = router;
