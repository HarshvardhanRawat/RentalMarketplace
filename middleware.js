const Listing = require('./models/listing');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        //redirect Url
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/listings');
    }
    const ownerId = listing.owner && listing.owner._id ? listing.owner._id : listing.owner;
    if(!ownerId || ownerId.toString() !== req.user._id.toString()){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};