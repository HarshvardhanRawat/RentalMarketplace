const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const main = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
};

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({... obj, owner: "6950fd2f1a75b0e29b227599" }));
    await Listing.insertMany(initData.data);
    console.log("DB Initialized with sample data");
}

main()
    .then(async () => {
        await initDB();
        console.log("Data initialization complete");
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
        mongoose.connection.close();
    });