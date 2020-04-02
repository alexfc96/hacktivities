require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const hbs = require('hbs');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const moment = require('moment');


const dbPath = process.env.DATABASE;

hbs.registerHelper('eq', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
const City = require('./models/City');
const seeds = require('./bin/seeds');
mongoose
  .connect(dbPath, {
    useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true,
  })
  .then((x) => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err);
  });

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60, // 1 day
    }),
    secret: 'hacktivities',
    resave: true,
    saveUninitialized: true,
    name: 'hacktivities',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.info = req.flash('info');
  next();
});
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const hacktivitiesRouter = require('./routes/hacktivities');
const citiesRouter = require('./routes/cities');

app.use('/', indexRouter);
app.use('/user', usersRouter); 
app.use('/hacktivities', hacktivitiesRouter);
app.use('/cities', citiesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { currentUser: req.session.userLogged });
});

module.exports = app;
