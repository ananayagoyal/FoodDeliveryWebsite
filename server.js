const mongoose = require("mongoose");
const express = require("express");
const path = require("path");

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/food-delivery")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static("public"));

// View engine
app.set("view engine", "ejs");

// Routes
const authRoutes = require("./routes/auth");
app.use(authRoutes);

// Signup page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});

// Login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Home page
app.get("/home", (req, res) => {
  res.render("home", { title: "Home" });
});

// Contact page
app.get("/contact", (req,res)=>{
    res.render("contact",{title:"Contact"});
});

app.post("/contact",(req,res)=>{

    const {name,email,message} = req.body;

    console.log(name,email,message);

    res.send("Your message has been sent successfully!");
});

// Menu Page
app.get("/menu",(req,res)=>{
    res.render("menu",{title:"Menu"});
});

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});