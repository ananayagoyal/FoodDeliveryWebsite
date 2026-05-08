const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  username: String,
  age: Number,
  password: String,
  profilePic: String,

  // 🛒 CART
  cart: [
    {
      name: String,
      price: Number,
      image: String,
      quantity: { type: Number, default: 1 }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);