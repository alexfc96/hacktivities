const express = require('express');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const router = express.Router();
const User = require('../models/User');
const City = require('../models/City');

const checkuser = require('../scripts/check');

/* GET home page. */
router.get('/', (req, res, next) => {
  const userId = req.session.userLogged;
  User.findById(userId) 
    .then((currentUser) => {
      res.render('index', { currentUser, userId, City });
    })
    .catch(() => {
      res.render('index', { title: 'Hacktivities' });
    });
});

router.get('/signup', (req, res, next) => {
  res.render('user/signup');
});

router.post('/signup', (req, res, next) => {
  const { username, password } = req.body;
  if (username === '' || password === '') {
    req.flash('error', 'The fields can not be empty');
    res.redirect('/user/signup');
  } else if (password.length < 6) {
    req.flash('error', 'The password requires at least 6 characters');
    res.redirect('/user/signup');
  } else {
    User.findOne({ username })
      .then((user) => {
        if (user) {
          req.flash('error', 'This username already exists');
          res.redirect('/login');
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

router.get('/login', (req, res, next) => {
  res.render('user/login');
});

router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  if (username === '' || password === '') {
    req.flash('error', 'The fields can not be empty');
    res.redirect('/login');
  } else {
    User.findOne({ username })
      .then((user) => {
        if (!user) {
          res.render('user/signup', { error: 'This user is not registered', username });
        } else {
          // eslint-disable-next-line no-lonely-if
          if (bcrypt.compareSync(password, user.userpassword)) {
            req.session.userLogged = user;
            checkuser.returnToTheLastPage(req, res, next);
            // req.flash('info', 'Welcome, now you are authenticated.');
            // res.redirect('/');
          } else {
            req.flash('error', 'Incorrect username or password');
            res.redirect('/login');
          }
        }
      })
      .catch((error) => {
        next(error);
      });
  }
});

router.get('/about-us', (req, res, next) => {
  res.render('about-us', { currentUser: req.session.userLogged });
});

router.get('/contact', (req, res, next) => {
  res.render('contact', { currentUser: req.session.userLogged });
});

module.exports = router;
