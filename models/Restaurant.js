const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  rating: String,
  image: String
});

const restaurantSchema = new mongoose.Schema({
  name: String,
  cuisine: String,
  rating: String,
  time: String,
  image: String,

  menu: [menuSchema]
});

module.exports = mongoose.model("Restaurant", restaurantSchema);