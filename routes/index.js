const express = require('express');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const router = express.Router();
const User = require('../models/User');

const checkuser = require('../scripts/checkuserlogued');

// router.use(checkuser.checkIfUserLoggedIn); //limita a visualizar las rutas a los no logueados

/* GET home page. */
router.get('/', (req, res, next) => {
  const user = req.session.userLogged;  //nos da el objeto con toda la info del user/session
  //console.log(user)
  User.findById(user) 
    .then((currentUser) => {
      res.render('index', { currentUser, title: 'Express' });
    })
    .catch(() => {
      res.render('index', { title: 'Express' });
    });
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
              req.session.userLogged = userCreated;
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
  console.log(req.body);
  const { username, password } = req.body;
  if (username === '' || password === '') {
    res.render('user/signup', { error: 'the fields can not be empty' });
  } else {
    User.findOne({ username })
      .then((user) => {
        console.log('working');
        if (!user) {
          res.render('user/signup', { error: 'this user is not registered' });
        } else {
          console.log(bcrypt.compareSync(password, user.userpassword));
          if (bcrypt.compareSync(password, user.userpassword)) {
            req.session.userLogged = user;
            res.redirect('/');
          } else {
            res.render('user/login', { error: 'Incorrect username or password' });
          }
        }
      })
      .catch((error) => {
        next(error);
      });
  }
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    }
    res.redirect('login');
  });
});

module.exports = router;
