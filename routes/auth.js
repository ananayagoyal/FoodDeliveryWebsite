const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");

const router = express.Router();

// ================= CONFIG =================
const JWT_SECRET = "super-secret-key";

// ================= IMPORT MODEL =================
const User = require("../models/User");

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// FILE FILTER (only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp|jfif|svg/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed ❌"));
  }
};

const upload = multer({ storage, fileFilter });


// ================= SIGNUP =================
router.post("/signup", upload.single("profilePic"), async (req, res) => {
  try {
    const { firstName, lastName, email, username, age, password } = req.body;

    if (!password || password.length < 5) {
      return res.render("signup", {
        message: "Password must be at least 5 characters ❌"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.render("signup", { message: "User already exists ❌" });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      age,
      password: hashedPassword,
      profilePic: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newUser.save();

    // 🔑 JWT TOKEN
    const token = jwt.sign({
      id: newUser._id,
      firstName: newUser.firstName,
      profilePic: newUser.profilePic
    }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true });

    res.redirect("/home");

  } catch (err) {
    console.error("Signup Error:", err);

    if (req.file) fs.unlinkSync(req.file.path);

    res.render("signup", { message: err.message });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", { message: "User not found ❌" });
    }

    // 🔐 COMPARE PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", { message: "Incorrect password ❌" });
    }

    // 🔑 JWT TOKEN
    const token = jwt.sign({
      id: user._id,
      firstName: user.firstName,
      profilePic: user.profilePic
    }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true });

    res.redirect("/home");

  } catch (err) {
    console.error("Login Error:", err);
    res.render("login", { message: "Login error ❌" });
  }
});


// ================= GOOGLE LOGIN =================

// STEP 1: Redirect to Google
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// STEP 2: Callback
router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {

    const user = req.user;

    const token = jwt.sign({
      id: user._id,
      firstName: user.firstName,
      profilePic: user.profilePic
    }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true });

    res.redirect("/home");
  }
);


// ================= LOGOUT =================
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;