const User = require("../models/User");
const express = require("express");
const path = require("path");

const router = express.Router();
const usersFile = path.join(__dirname, "..", "data", "users.json");

// LOGIN ROUTE
router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (user) {
      res.redirect("/home");
    } else {
      res.send("Invalid email or password ❌");
    }

  } catch (err) {
    console.log(err);
    res.send("Error during login");
  }

});

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {

  const { name, email, password } = req.body;

  try {
    const newUser = new User({
      name,
      email,
      password
    });

    await newUser.save();

    res.send("Signup successful ✅");

  } catch (err) {
    console.log(err);
    res.send("Error saving user");
  }

});

module.exports = router;