const express = require('express');
const User = require('../models/User');

const router = express.Router();
const checkuser = require('../scripts/checkuserlogged');
const Hacktivity = require('../models/Hacktivity');
const Booking = require('../models/Booking');

router.use(checkuser.checkIfUserLoggedIn); //limita a visualizar las rutas a los no logueados

/* GET users listing. */
router.get('/', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  //console.log(user);
  User.findById(user) 
    .then((currentUser) => {
      // Booking.find({atendees: user})
      //   .then((booking) => {
      //     console.log(booking)
      //     res.render('user/profile', { currentUser, booking });
      //   })
      // Hacktivity.findOne({hostId: user})
      //   .then((hacktivity) => {
      //     console.log(hacktivity);
      //     if(hacktivity && hacktivity.length == 0){
      //       console.log("Not owner of hacktivities");
      //     } else{
      //         res.render('user/profile', { currentUser, hacktivity });
      //     }
      //   })
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
    res.redirect('/');
  });
});

router.get('/:id/update', checkuser.checkIfUserLoggedIn, (req, res, next) => { // actualizar datos del user
  const user = req.session.userLogged._id;
  //console.log(user);
  User.findById(user) 
    .then((currentUser) => {
      //console.log(currentUser);
      res.render('user/update', { currentUser });
    })
    .catch(next);
});

router.post('/:id/update', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const {username} = req.body;
  const user = req.session.userLogged._id;
  User.findByIdAndUpdate({ _id: user }, {username})
  .then((userUpdated) =>{
    res.redirect('/')
  })
  .catch(next)
});

router.post('/:id/delete', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  User.findByIdAndDelete({ _id: user })
  .then((userDeleted) =>{
    console.log("Usuario eliminado")
    res.redirect('/signup')
  })
  .catch(next)
});

module.exports = router;
