const mongoose = require("mongoose");
const Restaurant = require("./models/Restaurant");

mongoose.connect("mongodb://127.0.0.1:27017/food-delivery");

async function seed() {

  await Restaurant.deleteMany();

  await Restaurant.insertMany([

    {
  name: "Pizza Palace",
  image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
  cuisine: "Pizza, Italian",
  rating: 4.7,
  deliveryTime: "25 mins",

  menu: [

    {
      name: "Margherita Pizza",
      category: "Pizza",
      price: 249,
      image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Farmhouse Pizza",
      category: "Pizza",
      price: 349,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Pepperoni Pizza",
      category: "Pizza",
      price: 399,
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Garlic Bread",
      category: "Sides",
      price: 149,
      image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Cheese Pasta",
      category: "Pasta",
      price: 299,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Cold Coffee",
      category: "Drinks",
      price: 129,
      image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Chocolate Lava Cake",
      category: "Dessert",
      price: 119,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop"
    }

  ]
},

    {
  name: "Burger Hub",
  image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop",
  cuisine: "Burgers, Fast Food",
  rating: 4.5,
  deliveryTime: "20 mins",

  menu: [

    {
      name: "Classic Veg Burger",
      category: "Burger",
      price: 149,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Cheese Burst Burger",
      category: "Burger",
      price: 199,
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Chicken Burger",
      category: "Burger",
      price: 229,
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "French Fries",
      category: "Sides",
      price: 99,
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Peri Peri Fries",
      category: "Sides",
      price: 129,
      image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Coke",
      category: "Drinks",
      price: 59,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Brownie",
      category: "Dessert",
      price: 99,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop"
    }

  ]
},

{
  name: "Indian Spice",
  image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1200&auto=format&fit=crop",
  cuisine: "North Indian, Punjabi",
  rating: 4.8,
  deliveryTime: "30 mins",

  menu: [

    {
      name: "Butter Chicken",
      category: "Main Course",
      price: 349,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Paneer Butter Masala",
      category: "Main Course",
      price: 299,
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Veg Biryani",
      category: "Biryani",
      price: 249,
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Chicken Biryani",
      category: "Biryani",
      price: 349,
      image: "https://images.unsplash.com/photo-1563379091339-03246963d29a?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Butter Naan",
      category: "Bread",
      price: 49,
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Mango Lassi",
      category: "Drinks",
      price: 99,
      image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=800&auto=format&fit=crop"
    },

    {
      name: "Gulab Jamun",
      category: "Dessert",
      price: 89,
      image: "https://images.unsplash.com/photo-1605197161470-5c4f1fcbf1f4?q=80&w=800&auto=format&fit=crop"
    }

  ]
}

  ]);

  console.log("Restaurants Added ✅");

  mongoose.connection.close();
}

seed();