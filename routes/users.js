const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();
const saltRounds = 10;

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('user/login');
});

router.get('/signup', (req, res, next) => { // darse de alta
  res.render('user/signup');
});

router.post('/signup', (req, res, next) => {
  const { username, password } = req.body;
  if (username === '' || password === '') {
    res.render('user/signup', { error: 'The fields can not be empty' }); // hacer de esto una funcion de un scrpit para no repetirlo
  } else {
    User.findOne({ username })
      .then((user) => {
        if (user) {
          res.render('user/signup', { error: 'This username already exists' });
        } else {
          const salt = bcrypt.genSaltSync(saltRounds);
          const userpassword = bcrypt.hashSync(password, salt);
          User.create({
            username,
            userpassword,
          })
            .then((userCreated) => {
              req.session.currentUser = userCreated;
              res.redirect('/user/login');
            })
            .catch((error) => {
              console.log('error', error);
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
  const { username, password } = req.body;
  if (username === '' || password === '') {
    res.render('user/signup', { error: 'this user is not registered' });
  } else {
    User.findOne({ username })
      .then(user => {
        if (!user) {
          res.render('user/signup', { error: 'this user is not registered' });
        } else {
          if (bcrypt.compareSync(password, user.userpassword)) {
            req.session.currentUser = user;
            res.redirect('/');
          } else {
            res.render('user/login', { error: 'Incorrect username or password' });
          }
        }
      })
      .catch(error => {
        next(error);
      });
  }
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    }
    res.redirect('user/login');
  });
});

module.exports = router;
