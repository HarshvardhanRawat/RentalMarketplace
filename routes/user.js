const expres = require('express');
const router = expres.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');

const {saveRedirectUrl} = require('../middleware.js');

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
            if (err) {
                return next(err);
            }
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
router.post('/login', 
        saveRedirectUrl, 
        passport.authenticate('local', 
            {failureFlash: true, 
            failureRedirect: '/login'
        }),
        async (req, res) => {
            req.flash('success', 'Welcome back!');
            let redirectUrl = res.locals.redirectUrl || '/listings';
            res.redirect(redirectUrl);
});

//Handle logout logic
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { 
            return next(err); 
        }
        req.flash('success', 'Logged you out!');
        res.redirect('/listings');
    });
});


module.exports = router;