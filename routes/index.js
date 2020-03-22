const express = require('express');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const router = express.Router();
const User = require('../models/User');
const City = require('../models/City');

/* GET home page. */
router.get('/', (req, res, next) => {
  const user = req.session.userLogged;  //nos da el objeto con toda la info del user/session
  console.log(user)
  //console.log(user)
  User.findById(user) 
    .then((currentUser) => {
      res.render('index', { currentUser, title: 'Hacktivities', user });
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
    res.render('user/signup', { error: 'The fields can not be empty' }); // hacer de esto una funcion de un scrpit para no repetirlo
  } else if (password.length < 6) {
    res.render('user/signup', { error: 'The password requires at least 6 characters' }); //comprobacion back para que no pueda cambiar desde el front
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
  //console.log(req.body);
  const { username, password } = req.body;
  if (username === '' || password === '') {
    res.render('user/signup', { error: 'the fields can not be empty' });
  } else {
    User.findOne({ username })
      .then((user) => {
        console.log(username)
        if (!user) {
          res.render('user/signup', { error: 'this user is not registered', username });
        } else {
          //console.log(bcrypt.compareSync(password, user.userpassword));
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

router.get('/:id', (req, res, next) => {
  const cityName = req.params;
  //console.log(cityName);
  City.find()
  .then((city) =>{
    //console.log(city);
    if(cityName===city.name){
      console.log("coincide");
    }else{
      next()
    }
  })
  .catch(next)
});

module.exports = router;
