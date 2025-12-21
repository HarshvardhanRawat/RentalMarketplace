const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Passport-Local-Mongoose setup
let passportLocalMongoose = require('passport-local-mongoose');

// Handle ES6 module default export
if (passportLocalMongoose && passportLocalMongoose.default) {
    passportLocalMongoose = passportLocalMongoose.default; // Use the default export
}

const userSchema = new Schema({
    email: {type: String, required: true, unique: true},
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);

