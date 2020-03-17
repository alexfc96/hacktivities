const express = require('express');

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
      //console.log(currentUser);
      res.render('index', { currentUser, title: 'Express' });
    })
    .catch(() => {
      res.render('index', { title: 'Express' });
    });
});

module.exports = router;
