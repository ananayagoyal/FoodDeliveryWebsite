const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  cuisine: {
    type: String
  },

  rating: {
    type: Number,
    default: 4.0
  },

  deliveryTime: {
    type: String,
    default: "30 mins"
  },

  menu: [
    {
      name: String,
      category: String,
      price: Number,
      image: String,
      description: String
    }
  ]

});

module.exports = mongoose.model("Restaurant", restaurantSchema);