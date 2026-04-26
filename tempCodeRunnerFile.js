const express = require('express');
const jwt = requier('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/food-delivery")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("MongoDB Connection Error:", err));

// User Schema for Signup
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: String,
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    age: Number,
    password: { type: String, required: true },
    profilePic: String,
    date: { type: Date, default: Date.now }
}, { collection: 'Users' });

// Fix: Check if model already exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
const JWT_SECRET = 'super-secret-key';

// ========== SIGNUP ROUTES ==========
app.get("/signup", (req, res) => {
    res.render("signup", { 
        title: "Sign Up - Food Delivery",
        message: null 
    });
});

app.post("/signup", upload.single('profilePic'), async (req, res) => {
    try {
        const { firstName, lastName, email, username, age, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render("signup", { 
                title: "Sign Up - Food Delivery",
                message: "Passwords do not match!" 
            });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.render("signup", { 
                title: "Sign Up - Food Delivery",
                message: "Username or Email already exists!" 
            });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            username,
            age: age || null,
            password
        });

        if (req.file) {
            newUser.profilePic = `/uploads/${req.file.filename}`;
        }

        await newUser.save();

        res.render("login", { 
            title: "Login - Food Delivery",
            message: "Signup successful! Please login." 
        });

    } catch (err) {
        console.error(err);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.render("signup", { 
            title: "Sign Up - Food Delivery",
            message: "Error: " + err.message 
        });
    }
});

// ========== LOGIN ROUTES ==========
app.get("/", (req, res) => {
    res.render("login", { 
        title: "Login - Food Delivery",
        message: null 
    },
    JWT_SECRET,
{ expiresIn: '1m'}
);
res.cookie('token', token, { httpOnly: true });
res.send("<h1>Login successful!</h1>");
res.redirect("/home");
});


app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ 
            $or: [{ username: username }, { email: username }] 
        });

        if (!user) {
            return res.render("login", { 
                title: "Login - Food Delivery",
                message: "User not found! Please signup first." 
            });
        }

        if (user.password !== password) {
            return res.render("login", { 
                title: "Login - Food Delivery",
                message: "Incorrect password!" 
            });
        }

        res.redirect(`/home`);

    } catch (err) {
        console.error(err);
        res.render("login", { 
            title: "Login - Food Delivery",
            message: "Error: " + err.message 
        });
    }
});

app.get("/home", (req, res) => {
    const { firstName, profilePic } = req.query;
    res.render("home", { 
        title: "Food Delivery - Home",
        loggedIn: true,
        firstName: firstName,
        profilePic: profilePic
    });
});

// ========== MENU ROUTE ==========
app.get("/menu", (req, res) => {
    const { firstName, profilePic } = req.query;
    res.render("menu", { 
        title: "Our Menu",
        loggedIn: true,
        firstName: firstName,
        profilePic: profilePic
    });
});

// ========== CART ROUTE ==========
app.get("/cart", (req, res) => {
    const { firstName, profilePic } = req.query;
    res.render("cart", {
        title: "Your Cart",
        loggedIn: true,
        firstName: firstName,
        profilePic: profilePic
    });
});

// ========== CONTACT ROUTES ==========
app.get("/contact", (req, res) => {
    const { firstName, profilePic } = req.query;
    res.render("contact", { 
        title: "Contact Us",
        loggedIn: true,
        firstName: firstName,
        profilePic: profilePic
    });
});

app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;
    console.log("Contact Form:", { name, email, message });
    res.send("Your message has been sent successfully!");
});

// ========== LOGOUT ==========
app.get("/logout", (req, res) => {
    res.redirect("/");
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});