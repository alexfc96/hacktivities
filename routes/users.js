const express = require('express');
const User = require('../models/User');

const router = express.Router();
const checkuser = require('../scripts/checkuserlogged');

router.use(checkuser.checkIfUserLoggedIn); //limita a visualizar las rutas a los no logueados

/* GET users listing. */
router.get('/', (req, res, next) => {
  const user = req.session.userLogged._id;
  //console.log(user);
  User.findById(user) 
    .then((currentUser) => {
      //console.log(currentUser);
      res.render('user/profile', { currentUser });
    })
    .catch(next);
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    }
    res.redirect('login');
  });
});

router.get('/:id/update', (req, res, next) => { // actualizar datos del user
  const user = req.session.userLogged._id;
  //console.log(user);
  User.findById(user) 
    .then((currentUser) => {
      //console.log(currentUser);
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
});

router.post('/:id/delete', (req, res, next) => {
  const user = req.session.userLogged._id;
  User.findByIdAndDelete({ _id: user })
  .then((userDeleted) =>{
    console.log("Usuario eliminado")
    res.redirect('/signup')
  })
  .catch(next)
});

//Decidir si poner solo /user y que te salga toda la info o como está aqui que aparezca el id cuando no estamos utilizando el req.params
// router.get('/:id', (req, res, next) => { 
//   const user = req.session.userLogged._id;
//   //console.log(user);
//   User.findById(user) 
//     .then((currentUser) => {
//       console.log(currentUser);
//       res.render('user/profile', { currentUser });
//     })
//     .catch(next);
// });

module.exports = router;
