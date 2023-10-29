// import 
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const session = require("express-session");
const path = require('path');
var multer      = require('multer');
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 4000;
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URI, () => {
    console.log("Connected to MongoDB");
  });


// middlewares
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));
app.set('view engine','ejs');

// cookie parser middleware
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})
// route prefix
app.use("", require("./routes/routes"));

app.listen(PORT,()=>{
    console.log(`Server started at http\\:localhost: ${PORT}`);
});