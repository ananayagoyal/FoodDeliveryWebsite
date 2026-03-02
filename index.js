<<<<<<< HEAD
const http = require("http");
const express = require('express');
const path = require('path');
const { title } = require("process");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.listen(3001,()=>{
    console.log('Server is running on port 3001');
});

app.get('/',( req, res ) => {
    res.render("home",{title: "Home"});
=======
const http = require("http");
const express = require('express');
const path = require('path');
const { title } = require("process");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.listen(3001,()=>{
    console.log('Server is running on port 3001');
});

app.get('/',( req, res ) => {
    res.render("home",{title: "Home"});
>>>>>>> 6349c782dd9d9d89062984a01713f8db60939432
})