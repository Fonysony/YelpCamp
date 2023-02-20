const express = require('express');
const app = express();
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { campgroundSchema } = require('./schemas.js');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const folder = `${__dirname}`;
const Campground = require('./models/campground.js');

const connectExpress = function (port) {
  app.listen(port, () => {
    console.log(`Express is listening on port ${port}`);
  });
};
connectExpress(3000);

const connectMongo = async function (dbName) {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`);
    console.log(`${dbName} DB has connected to Mongo`);
  } catch (error) {
    console.log(error);
  }
};
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

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(element => element.message).join(',');
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

app.get('/', (req, res) => {
  res.send('Front Page!');
});

app.get('/makecampground', catchAsync(async (req, res) => {
    const campground = new Campground({
      title: 'Minecraft',
      description: 'Blocks of blocks',
      location: 'USA',
      price: '60',
    });
    await campground.save();
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds, status: 'All' });
  })
);

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new.ejs');
});

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show.ejs', { campground });
  })
);

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit.ejs', { campground });
  })
);

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
  console.log('TEST');
  })
);

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
  })
);

app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'OH no ERROR, PAIN!';
  res.status(statusCode).render('error.ejs', { err });
});

