const express = require("express");
const router = express.Router();
const User = require("./../models/User");
const bcrypt = require("bcrypt");

// POST /user/signup
// Creates a new user account
router.post("/signup", async (req, res) => {
  try {
    // 1. Ensure the request has a JSON body
    if (!req.body) {
      return res.status(400).json({ status: "FAILED", message: "Missing request body." });
    }

    // 2. Extract and clean user inputs
    let { name = "", email = "", password = "", dateOfBirth = "" } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    // 3. Validate presence of all fields
    if (!name || !email || !password || !dateOfBirth) {
      return res.status(400).json({ status: "FAILED", message: "All fields are required: name, email, password, and date of birth." });
    }

    // 4. Validate field formats
    const namePattern = /^[a-zA-Z\s'-]+$/;
    if (!namePattern.test(name)) {
      return res.status(400).json({ status: "FAILED", message: "Name can only contain letters, spaces, apostrophes, or hyphens." });
    }

    const emailPattern = /^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ status: "FAILED", message: "Please enter a valid email address." });
    }

    // Expect date in YYYY-MM-DD format
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateOfBirth) || !new Date(dateOfBirth).getTime()) {
      return res.status(400).json({ status: "FAILED", message: "Please enter date of birth as YYYY-MM-DD." });
    }

    if (password.length < 8) {
      return res.status(400).json({ status: "FAILED", message: "Password must be at least 8 characters long." });
    }

    // 5. Check if email is already registered
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({ status: "FAILED", message: "An account with this email already exists." });
    }

    // 6. Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create and save the new user document
    const user = new User({ name, email, password: hashedPassword, dateOfBirth });
    const savedUser = await user.save();

    // 8. Respond with the new user's basic info (excluding password)
    return res.status(201).json({
      status: "SUCCESS",
      message: "Signup successful!",
      data: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        dateOfBirth: savedUser.dateOfBirth,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ status: "FAILED", message: "Server error during signup." });
  }
});

// POST /user/signin
// Authenticates an existing user
router.post("/signin", async (req, res) => {
  try {
    // 1. Ensure the request has a JSON body
    if (!req.body) {
      return res.status(400).json({ status: "FAILED", message: "Missing request body." });
    }

    // 2. Extract and clean credentials
    let { email = "", password = "" } = req.body;
    email = email.trim();
    password = password.trim();

    // 3. Validate presence of credentials
    if (!email || !password) {
      return res.status(400).json({ status: "FAILED", message: "Email and password are required." });
    }

    // 4. Look up the user by email
    const user = await User.findOne({ email }).lean();
    if (!user) {
      // Do not reveal whether email or password was incorrect
      return res.status(401).json({ status: "FAILED", message: "Invalid email or password." });
    }

    // 5. Compare provided password to stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "FAILED", message: "Invalid email or password." });
    }

    // 6. Successful authentication: return user info (token/session logic can go here)
    return res.status(200).json({
      status: "SUCCESS",
      message: "Signin successful!",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ status: "FAILED", message: "Server error during signin." });
  }
});

module.exports = router;
