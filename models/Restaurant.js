const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  image: String
});

const restaurantSchema = new mongoose.Schema({
  name: String,
  image: String,
  cuisine: String,
  rating: Number,
  deliveryTime: String,
  menu: [menuSchema]
});

module.exports = mongoose.model("Restaurant", restaurantSchema);