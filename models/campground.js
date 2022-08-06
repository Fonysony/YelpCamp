const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    description: String,
    location: String,
    image: String,
    price: Number,
});

module.exports = mongoose.model('Campground', CampgroundSchema);