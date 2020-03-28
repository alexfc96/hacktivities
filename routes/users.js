const express = require('express');
const User = require('../models/User');

const router = express.Router();
const checkuser = require('../scripts/check');
const Hacktivity = require('../models/Hacktivity');
const Booking = require('../models/Booking');

router.use(checkuser.checkIfUserLoggedIn); // limita a visualizar las rutas a los no logueados

/* GET users listing. */
router.get('/', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  // console.log(user);
  User.findById(user)
    .then((currentUser) => {
      res.render('user/profile', { currentUser});
    })
    .catch(next);
});

router.get('/my-hacktivities', (req, res, next) => {
  const user = req.session.userLogged._id;
  Hacktivity.find({ hostId: user })
    .then((hacktivity) => {
      console.log(hacktivity);
      res.render('user/my-hacktivities', { hacktivity });
    })
    .catch(()=>{
      res.render('user/my-hacktivities');
    });
});

router.get('/my-bookings', (req, res, next) => {
  const user = req.session.userLogged._id;
  Booking.find({ atendees: { $in: [user] } })
    .populate('hacktivityId atendees')
    .then((booking) => {
      //console.log(booking);
      res.render('user/my-bookings', { booking });
    })
    .catch((booking)=>{
      res.render('user/my-bookings');
    });
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
  // console.log(user);
  User.findById(user)
    .then((currentUser) => {
      // console.log(currentUser);
      res.render('user/update', { currentUser });
    })
    .catch(next);
});

router.post('/:id/update', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const {username} = req.body;
  const user = req.session.userLogged._id;
  User.findByIdAndUpdate({ _id: user }, { username })
    .then(() => {
      req.flash('info','User updated');
      res.redirect('/user');
    })
    .catch(next);
});

router.post('/:id/delete', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  User.findByIdAndDelete({ _id: user })
    .then(() => {
      console.log('User deleted');
      req.flash('info','User deleted');
      res.redirect('/signup');
      req.session.destroy();
    })
    .catch(next);
});
//done

module.exports = router;
