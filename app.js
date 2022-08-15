const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const folder = `${__dirname}`;
const Campground = require('./models/campground.js');

const connectExpress = function(port) {
    app.listen(port, () => {
        console.log(`Express is listening on port ${port}`);
    });
}
connectExpress(3000);

const connectMongo = async function(dbName) {
    try {
        await mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`);
        console.log(`${dbName} DB has connected to Mongo`);
    } catch(error) {
        console.log(error);
    }
}
connectMongo('yelpdata');

const morgan = (req, res, next) => {
    req.requestTime = Date.now();
    console.log(req.method, req.path);
    next();
};

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', `${folder}/public`);

app.get('/', (req, res) => {
    res.send('Front Page!');
});

app.get('/makecampground', async (req, res) => {
    const campground = new Campground({ title: 'Minecraft', description: 'Blocks of blocks', location: 'USA', price: '60'});
    await campground.save();
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index.ejs', { campgrounds, status: 'All' });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('./campgrounds/new.ejs');
});

app.post('/campgrounds', async (req, res) => {
    console.log('/campgrounds', req.body);
    const campground = new Campground(req.body);
    await campground.save();
    console.log('created camp', campground);
    res.redirect(`/campgrounds/${campground._id}`);
});

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    console.log('/campgrounds/:id', campground);
    res.render('./campgrounds/show.ejs', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('./campgrounds/edit.ejs', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
});

app.delete('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
});


app.use((req, res) => {
    res.status(404).send('NOT FOUND');
});
