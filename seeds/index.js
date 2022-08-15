const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const { descriptors, places } = require('./seedHelper');
const cities = require('./cities.js');

const connectMongo = async function(dbName) {
    try {
        await mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`);
    } catch(error) {
        console.log(error);
    }
}
connectMongo('yelpdata');

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const campground = new  Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: 'I am in love with the neovim experience!',
            title: `${sample(descriptors)}, ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            price

        });
        await campground.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
