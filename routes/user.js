const expres = require('express');
const router = expres.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');


//Render signup form
router.get('/signup', (req, res) => {
    res.render('users/signup.ejs');
});

//Handle signup logic
router.post('/signup', wrapAsync(async(req, res) => {
    try {
        const {username, email, password} = req.body;
        const user = new User({username, email});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Rental Marketplace!');
            res.redirect('/listings');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('signup');
    }
}));

//Render login form
router.get('/login', (req, res) => {
    res.render('users/login.ejs');
});

//Handle login logic
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/listings'; //get previous url from session
    delete req.session.returnTo; //clean up session
    res.redirect(redirectUrl); //redirect to previous url or listings
});

module.exports = router;