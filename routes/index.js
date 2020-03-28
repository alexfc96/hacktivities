const express = require('express');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const router = express.Router();
const User = require('../models/User');
const City = require('../models/City');

/* GET home page. */
router.get('/', (req, res, next) => {
  const userId = req.session.userLogged;  //nos da el objeto con toda la info del user/session
  //console.log(user)
  User.findById(userId) 
    .then((currentUser) => {
      res.render('index', { currentUser, userId, City });
    })
    .catch(() => {
      res.render('index', { title: 'Hacktivities' });
    });
});

router.get('/signup', (req, res, next) => { // darse de alta
  res.render('user/signup');
});

router.post('/signup', (req, res, next) => {
  const { username, password } = req.body;
  if (username === '' || password === '') {
    req.flash('error', 'The fields can not be empty');
    res.redirect('/user/signup');
  } else if (password.length < 6) {
    req.flash('error', 'The password requires at least 6 characters');
    res.redirect('/user/signup'); // comprobacion back para que no pueda cambiar desde el front
  } else {
    User.findOne({ username })
      .then((user) => {
        if (user) {
          req.flash('error', 'This username already exists'); // no lo muestra
          res.redirect('/user/login');
        } else {
          const salt = bcrypt.genSaltSync(saltRounds);
          const userpassword = bcrypt.hashSync(password, salt);
          User.create({
            username,
            userpassword,
          })
            .then((userCreated) => {
              req.session.userLogged = userCreated;
              req.flash('info', 'Thank you for creating your account, now you are authenticated.');
              res.redirect('/');
            })
            .catch((error) => {
              next(error);
            });
        }
      })
      .catch((error) => {
        next(error);
      });
  }
});

router.get('/login', (req, res, next) => { // darse de alta
  res.render('user/login');
});

router.post('/login', (req, res, next) => {
  // console.log(req.body);
  const { username, password } = req.body;
  if (username === '' || password === '') {
    req.flash('error', 'The fields can not be empty');
    res.redirect('/user/signup');
  } else {
    User.findOne({ username })
      .then((user) => {
        console.log(username);
        if (!user) {
          res.render('user/signup', { error: 'This user is not registered', username });
        } else {
          // console.log(bcrypt.compareSync(password, user.userpassword));
          // eslint-disable-next-line no-lonely-if
          if (bcrypt.compareSync(password, user.userpassword)) {
            req.session.userLogged = user;
            req.flash('welcomeMessage', 'Thank you for creating your account, now you are authenticated.');
            res.redirect('/');
          } else {
            req.flash('error', 'Incorrect username or password');
            res.redirect('/user/login');
          }
        }
      })
      .catch((error) => {
        next(error);
      });
  }
});

router.get('/:id', (req, res, next) => {
  const cityName = req.params;
  // console.log(cityName);
  City.find()
    .then((city) => {
    // console.log(city);
      if (cityName === city.name) {
        console.log('coincide');
      } else {
        next();
      }
    })
    .catch(next);
});

module.exports = router;
