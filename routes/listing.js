const expres = require('express');
const router = expres.Router(mergeParams = true);
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const { isLoggedIn } = require('../middleware.js');
const { isOwner } = require('../middleware.js');
const methodOverride = require('method-override');


//Method Override setup
router.use(methodOverride('_method'));

//Needed to read form data
router.use(expres.urlencoded({ extended: true }));

//Validation middleware
const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


//Index route
router.get ('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('./listings/index.ejs' , {allListings});
}));


//New route
router.get('/new', isLoggedIn, (req, res) => {
    res.render('./listings/new.ejs');
});


//Show route
router.get('/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews').populate('owner');

    if(!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/listings');
    };

    res.render('./listings/show.ejs', {listing});
}));


//Create route
router.post('/', validateListing, isLoggedIn, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'Successfully created a new listing!');
    res.redirect("/listings");
}));


//Edit route 
router.get('/:id/edit', validateListing, isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);

    if(!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/listings');
    };

    res.render('./listings/edit.ejs', {listing});
}));


//Update route
router.put('/:id', isLoggedIn, isOwner,wrapAsync(async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash('success', 'Successfully updated the listing!');
    res.redirect(`/listings/${listing._id}`);
}));


//Delete route 
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the listing!');
    res.redirect('/listings');
}));

module.exports = router;
