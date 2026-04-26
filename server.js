const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ================== CONFIG ==================
const JWT_SECRET = 'super-secret-key';

// ================== DB ==================
mongoose.connect("mongodb://127.0.0.1:27017/food-delivery")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("MongoDB Error:", err));

// ================== SCHEMA ==================
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: String,
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    age: Number,
    password: { type: String, required: true },
    profilePic: String,
    date: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ================== MULTER ==================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ================== MIDDLEWARE ==================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================== AUTH MIDDLEWARE ==================
const auth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.redirect("/");

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect("/");
    }
};

// ================== ROUTES ==================

// LOGIN PAGE
app.get("/", (req, res) => {
    res.render("login", {
        title: "Login - Food Delivery",
        message: null
    });
});

// SIGNUP PAGE
app.get("/signup", (req, res) => {
    res.render("signup", {
        title: "Sign Up - Food Delivery",
        message: null
    });
});

// SIGNUP
app.post("/signup", upload.single('profilePic'), async (req, res) => {
    try {
        const { firstName, lastName, email, username, age, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render("signup", { title: "Sign Up", message: "Passwords do not match!" });
        }

        const exists = await User.findOne({ $or: [{ username }, { email }] });
        if (exists) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.render("signup", { title: "Sign Up", message: "User already exists!" });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            username,
            age,
            password,
            profilePic: req.file ? `/uploads/${req.file.filename}` : null
        });

        await newUser.save();

        res.render("login", {
            title: "Login",
            message: "Signup successful! Please login."
        });

    } catch (err) {
        console.error(err);
        res.render("signup", { title: "Error", message: err.message });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.render("login", {
                title: "Login",
                message: "User not found!"
            });
        }

        if (user.password !== password) {
            return res.render("login", {
                title: "Login",
                message: "Incorrect password!"
            });
        }

        // CREATE TOKEN
        const token = jwt.sign({
            id: user._id,
            firstName: user.firstName,
            username: user.username,
            profilePic: user.profilePic
        }, JWT_SECRET, { expiresIn: "1h" });

        // SET COOKIE
        res.cookie("token", token, { httpOnly: true });

        res.redirect("/home");

    } catch (err) {
        console.error(err);
        res.render("login", { title: "Error", message: err.message });
    }
});

// HOME (PROTECTED)
app.get("/home", auth, (req, res) => {
    res.render("home", {
        title: "Home",
        loggedIn: true,
        firstName: req.user.firstName,
        profilePic: req.user.profilePic
    });
});

// MENU
app.get("/menu", auth, (req, res) => {
    res.render("menu", {
        title: "Menu",
        loggedIn: true,
        firstName: req.user.firstName,
        profilePic: req.user.profilePic
    });
});

// CART
app.get("/cart", auth, (req, res) => {
    res.render("cart", {
        title: "Cart",
        loggedIn: true,
        firstName: req.user.firstName,
        profilePic: req.user.profilePic
    });
});

// CONTACT
app.get("/contact", auth, (req, res) => {
    res.render("contact", {
        title: "Contact",
        loggedIn: true,
        firstName: req.user.firstName,
        profilePic: req.user.profilePic
    });
});

app.post("/contact", (req, res) => {
    console.log(req.body);
    res.send("Message sent!");
});

// LOGOUT
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

// ================== SERVER ==================
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000 ");
});