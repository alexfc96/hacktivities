const express = require('express');

const router = express.Router();
const User = require('../models/User');

const checkuser = require('../scripts/checkuserlogued');

// router.use(checkuser.checkIfUserLoggedIn); //limita a visualizar las rutas a los no logueados

/* GET home page. */
router.get('/', (req, res, next) => {
  // const user = User.find(user => user.id === req.session.userId)
  const user = req.session.userId; //daigual userid o user_id
  console.log(req.session);
  User.find(user)  //si pruebo con findbyid no funciona
    .then((currentUser) => {
      console.log(currentUser)  //me indica undefined
      res.render('index', { currentUser, title: 'Express' });
    })
    .catch(() => {
      res.render('index', { title: 'Express' });
    });
});

module.exports = router;
