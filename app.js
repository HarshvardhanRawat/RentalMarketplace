//Load environment variables from .env file
require('dotenv').config();

//Import required modules
const expres = require('express');
const app = expres();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const flash = require('connect-flash');

//Passport configuration
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');


//Import models and utilities
const Listing = require('./models/listing.js');
const path = require('path');
const wrapAsync = require('./utils/wrapAsync.js');

//Session configuration
const session = require('express-session');
const sessionOptions = {
    secret: "thisshould",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};


//Needed to read form data
app.use(expres.urlencoded({ extended: true }));


//Ejs-Mate setup
app.engine('ejs', ejsMate);
app.use(expres.static(path.join(__dirname, 'public')));
app.use('/logo', expres.static(path.join(__dirname, 'logo')));

//View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//Method Override setup
app.use(methodOverride('_method'));

//Server configuration
const port = process.env.PORT || 8080;
// const MONGO_URL = 'mongodb://127.0.0.1:27017/aircnc';
//MongoDB connection
async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
}

//Flash middleware setup
app.use(session(sessionOptions));
app.use(flash());
//Passport middleware setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Custom middleware to set local variables for templates
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});


// Home Route
app.get('/', wrapAsync(async (req, res) => {
    const heroListings = await Listing.find({}).limit(5);
    res.render("listings/main.ejs", {heroListings});
}));

//Listings Routes
const listings = require('./routes/listing.js');
app.use('/listings', listings);

//Reviews Routes
const reviews = require('./routes/review.js');
app.use('/listings/:id/reviews', reviews);

//User Routes
const users = require('./routes/user.js');
app.use('/', users);

//Test route to create a sample listing
// app.get("/testListing" , async (req, res) => {
//     let sampleListing = new Listing({
//         title: 'my new villa',
//         description: 'by the beach',
//         price: 1200,
//         location: 'Goa',
//         country: 'India',
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send('successful testing');
// });

//Error handling middleware
app.use((err, req, res, next) => {
    let {statusCode=500, message="Something Went Wrong!"} = err;
    res.status(statusCode).render('error.ejs', {err});
    //res.status(statusCode).send(message);
});


//Server setup - Start server after MongoDB connection
main()
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    });