//Require necessary modules
require('dotenv').config();
const expres = require('express');
const app = expres();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const ejs = require('ejs');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema , reviewSchema} = require('./schema.js');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Review = require('./models/review.js');

//Needed to read form data
app.use(expres.urlencoded({ extended: true }));


//Ejs-Mate setup
app.engine('ejs', ejsMate);
app.use(expres.static(path.join(__dirname, 'public')));
app.use('/logo', expres.static(path.join(__dirname, 'logo')));


//Method Override setup
app.use(methodOverride('_method'));


const port = process.env.PORT || 8080;
// const MONGO_URL = 'mongodb://127.0.0.1:27017/aircnc';

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


// Home route
app.get('/', wrapAsync(async (req, res) => {
    const heroListings = await Listing.find({}).limit(5);
    res.render("listings/main.ejs", {heroListings});
}));


//Index route
app.get ('/listings', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('./listings/index.ejs' , {allListings});
}));


//New route
app.get('/listings/new', (req, res) => {
    res.render('./listings/new.ejs');
});


//Show route
app.get('/listings/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    res.render('./listings/show.ejs', {listing});
}));


//Create route
app.post('/listings', validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));


//Edit route 
app.get('/listings/:id/edit', validateListing, wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('./listings/edit.ejs', {listing});
}));


//Update route
app.put('/listings/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${listing._id}`);
}));


//Delete route 
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));


//Reviews
//Post review route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//Delete review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let {id , reviewId} =  req.params;
    await Review.findById(reviewId);
    Listing.findByIdAndUpdate(id , {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));


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