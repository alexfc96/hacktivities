const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();
const saltRounds = 10;

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('user/login');
});

router.get('/:id/update', (req, res, next) => { // actualizar datos del user
  const user = req.session.userLogged._id;
  //console.log(user);
  User.findById(user) 
    .then((currentUser) => {
      console.log(currentUser);
      res.render('user/update', { currentUser });
    })
    .catch(next);
});

router.post('/:id/update', (req, res, next) => {
  const {username} = req.body;
  const user = req.session.userLogged._id;
  User.findByIdAndUpdate({ _id: user }, {username})
  .then((userUpdated) =>{
    res.redirect('/')
  })
  .catch(next)
})


module.exports = router;
