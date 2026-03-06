const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const usersFile = path.join(__dirname, "..", "data", "users.json");

// LOGIN
router.post("/login", (req, res) => {

  const { email, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    res.redirect("/home");
  } else {
    res.send("Invalid email or password");
  }

});

// SIGNUP  ✅ THIS MUST EXIST
router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

  users.push({ name, email, password });

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.send("Signup successful");
});

module.exports = router;