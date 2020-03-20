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

const dbPath = process.env.DATABASE;

//const seeds = require('./bin/seeds');

mongoose
  //.connect('mongodb://localhost/starter-code', {useNewUrlParser: true})
  .connect(dbPath, {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  //   .then(() =>{
  //   return City.deleteMany();
  // })
  // .then(() => {
  //   return City.create(seeds);
  // })
  // .then(() => {
  //   console.log('succesfully added all the data');
  //   mongoose.connection.close();
  // })
  .catch(err => {
    console.error('Error connecting to mongo', err)
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
  })
);
app.use(flash());


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');  //js en plural
const hacktivitiesRouter = require('./routes/hacktivities')

app.use('/', indexRouter);
app.use('/user', usersRouter); //respuesta en singular
app.use('/hacktivities', hacktivitiesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
