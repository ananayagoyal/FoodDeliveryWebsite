const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const fetch = require("node-fetch");

require("dotenv").config();

// Load passport config
require("./config/passport");

const app = express();

// ================= CONFIG =================
const JWT_SECRET = "super-secret-key";

// ================= IMPORT MODELS =================
const User = require("./models/User");
const Order = require("./models/Order");
const Restaurant = require("./models/Restaurant");

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// SESSION (required for Google login)
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// ================= STATIC FILES =================
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= DATABASE =================
mongoose.connect("mongodb://127.0.0.1:27017/food-delivery")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("MongoDB Error ❌", err));

// ================= OPTIONAL AUTH =================
app.use((req, res, next) => {
  const token = req.cookies.token;

  res.locals.name = null;
  res.locals.profilePic = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      res.locals.name = decoded.firstName;
      res.locals.profilePic = decoded.profilePic;
    } catch (err) {
      // ignore invalid token
    }
  }

  next();
});

// ================= STRICT AUTH =================
const auth = (req, res, next) => {
  if (!req.user) return res.redirect("/login");
  next();
};

// ================= ROUTES =================
const authRoutes = require("./routes/auth");
app.use(authRoutes);

// ================= PUBLIC ROUTES =================
app.get("/", (req, res) => {
  res.render("login", { message: null });
});

app.get("/login", (req, res) => {
  res.render("login", { message: null });
});

app.get("/signup", (req, res) => {
  res.render("signup", { message: null });
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/menu", async (req, res) => {

  const restaurants = await Restaurant.find();

  let allMenuItems = [];

  restaurants.forEach((restaurant) => {

    restaurant.menu.forEach((item) => {

      allMenuItems.push({
        ...item._doc,
        restaurantName: restaurant.name
      });

    });

  });

  res.render("menu", {
    menuItems: allMenuItems
  });

});

app.get("/contact", (req, res) => {
  res.render("contact");
});


// ================= RESTAURANTS PAGE =================

app.get("/restaurants", async (req, res) => {

  const restaurants = await Restaurant.find();

  res.render("restaurants", { restaurants });

});

app.get("/restaurant/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.send("Restaurant not found ❌");
    }

    res.render("restaurant-menu", {
      restaurant
    });
  } catch (err) {
    console.log(err);
    res.send("Error loading restaurant ❌");
  }
});

// ================= CART =================

// ADD TO CART
app.post("/add-to-cart", auth, async (req, res) => {
  try {
    const { name, price, image } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.redirect("/login");

    const existingItem = user.cart.find(item => item.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({
        name,
        price,
        image,
        quantity: 1
      });
    }

    await user.save();
    res.redirect("/cart");

  } catch (err) {
    console.error(err);
    res.send("Error adding to cart ❌");
  }
});

// VIEW CART
app.get("/cart", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.redirect("/login");

    const total = user.cart.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.render("cart", {
      cart: user.cart,
      total
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading cart ❌");
  }
});

// INCREASE
app.post("/increase", auth, async (req, res) => {
  const { index } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.redirect("/login");

  user.cart[index].quantity += 1;

  await user.save();
  res.redirect("/cart");
});

// DECREASE
app.post("/decrease", auth, async (req, res) => {
  const { index } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.redirect("/login");

  if (user.cart[index].quantity > 1) {
    user.cart[index].quantity -= 1;
  } else {
    user.cart.splice(index, 1);
  }

  await user.save();
  res.redirect("/cart");
});

// REMOVE ITEM
app.post("/remove-from-cart", auth, async (req, res) => {
  const { index } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.redirect("/login");

  user.cart.splice(index, 1);

  await user.save();
  res.redirect("/cart");
});

// ================= CHECKOUT =================

// CHECKOUT PAGE
app.get("/checkout", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.redirect("/login");

  res.render("checkout", {
    cart: user.cart
  });
});

// PLACE ORDER
app.post("/place-order", auth, async (req, res) => {
  try {
    const { address, phone } = req.body;

    if (!address || !phone) {
      return res.send("All fields required ❌");
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.cart.length) {
      return res.send("Cart is empty ❌");
    }

    const totalAmount = user.cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const newOrder = new Order({
      userId: user._id,
      items: user.cart.map(item => ({
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      })),
      totalAmount,
      address,
      phone
    });

    await newOrder.save();

    // CLEAR CART
    user.cart = [];
    await user.save();

    res.render("success", { totalAmount });

  } catch (err) {
    console.error(err);
    res.send("Order failed ❌");
  }
});

// ================= LIVE LOCATION =================

// ================= GET ADDRESS =================

app.get("/get-address", async (req, res) => {

  try {

    const { lat, lon } = req.query;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "FoodieHubApp"
        }
      }
    );

    const data = await response.json();

    res.json(data);

  } catch (err) {

    console.log(err);

    res.json({
      error: "Unable to fetch address"
    });
  }
});

// ================= CONTACT =================
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  console.log("Contact:", name, email, message);
  res.send("Message sent successfully!");
});

// ================= LOGOUT =================
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.logout(() => {});
  res.redirect("/login");
});

// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});