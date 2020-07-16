const express = require("express");
const app = express();
const productRoutes = require("./api/routes/products");
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require("cors");
const mongoose = require('mongoose')
app.use(cors());


console.log('PASSWORD: ', process.env.MONGO_ATLAS_PW, "SECRET_KEY: ", process.env.MONGO_ATLAS_PW)

// Connecting to the Mongo Atlas database                                         
mongoose.connect('mongodb+srv://chrisfotos:sed1sed1@node-rest-shop-7baom.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true })

mongoose.Promise = global.Promise;


app.set('view engine', 'ejs')

// Set up body parser and Morgan, other middlewear
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));
app.use(express.static('public/build'));
app.use(cookieParser());


app.use(cors());

// Set up the products and orders routes
app.use("/products", productRoutes);
app.use("/orders", orderRoutes)
app.use("/user", userRoutes)

// Set up view routes
app.get('/login', (req, res, next) => {
    res.render('login')
}
)

// Error handling
app.use((req, res, next) => {
    const error = new Error('not found');
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;