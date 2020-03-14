const express = require('express');
const router = express.Router();
const User = require('../models/User');

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('users/login');
});

router.get('/signup', (req, res, next) => {  //darse de alta
  res.render('users/signup');
});

router.post('/signup', (req, res, next)=> {
  console.log(req.body)
  const { username, password } = req.body;
  User.create({
    username,
    password,
  }).then(()=>{
    res.redirect('/user/signup');
  }).catch(next);
});

module.exports = router;
