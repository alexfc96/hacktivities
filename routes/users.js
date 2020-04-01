const express = require('express');
const moment = require('moment');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const router = express.Router();
const checkuser = require('../scripts/check');
const User = require('../models/User');
const Hacktivity = require('../models/Hacktivity');
const Booking = require('../models/Booking');

// router.use(checkuser.checkIfUserLoggedIn); // limita a visualizar las rutas a los no logueados

/* GET users listing. */
router.get('/', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  // console.log(user);
  User.findById(user)
    .then((currentUser) => {
      res.render('user/profile', { currentUser });
    })
    .catch(next);
});

router.get('/my-hacktivities', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  // const today = moment();
  // const todayDate = today.format("YYYY-MM-DD");
  //console.log(todayDate);
  Hacktivity.find({ hostId: user })
    .then((hacktivity) => {
      console.log(hacktivity);
      // const hacktivityDate = moment(hacktivity.date).format('YYYY-MM-DD');
      // console.log(hacktivityDate);
      res.render('user/my-hacktivities', { hacktivity, currentUser: req.session.userLogged });
    })
    .catch(() => {
      res.render('user/my-hacktivities', { currentUser: req.session.userLogged });
    });
});

router.get('/my-bookings', checkuser.checkIfUserLoggedIn, (req, res, next) => { 
  const user = req.session.userLogged._id;
  Booking.find({ atendees: { $in: [user] } })
    .populate('hacktivityId atendees')
    .then((booking) => {
      // console.log(booking);
      res.render('user/my-bookings', { booking, currentUser: req.session.userLogged });
    })
    .catch((booking) => {
      res.render('user/my-bookings', { currentUser: req.session.userLogged });
    });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    }
    res.redirect('/login');
  });
});
// GET user BY ID
router.get('/:_id/public', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const userId = req.params;
  User.findById(userId)
  
    .then((user) => {
      Hacktivity.find({hostId: userId})
      .then((hacktivities) => {
         
          res.render('user/public', { user, hacktivities, currentUser: req.session.userLogged });
      })
    .catch((error) => {
      req.flash('info', 'We have not found this user in the database.', error);
      res.redirect('/hacktivities');
    });
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
  const { username, currentpassword, newuserpassword } = req.body;
  const user = req.session.userLogged._id;
  User.findByIdAndUpdate({ _id: user }, { username })
    .then((userInfo) => {
      if (checkuser.isValueInvalid(currentpassword) || checkuser.isValueInvalid(newuserpassword)) {
        req.flash('info', 'User updated');
        res.redirect('/user/logout');
      } else {
        // eslint-disable-next-line no-lonely-if
        if (newuserpassword.length < 6) {
          req.flash('error', 'The password requires at least 6 characters');
          res.redirect(`/user/${user}/update`); // comprobacion back para que no pueda cambiar desde el front
        }
        if (bcrypt.compareSync(currentpassword, userInfo.userpassword)) {
          console.log('La contraseña es la correcta');
          const salt = bcrypt.genSaltSync(saltRounds);
          const userpassword = bcrypt.hashSync(newuserpassword, salt);
          User.findByIdAndUpdate({ _id: user }, { userpassword })
            .then(() => {
              console.log('Contraseña cambiada');
              req.flash('info', 'Password updated'); // Falta saber indicar al usuario que se ha cambiado correctamente ya que pasa por 2 rutas diferentes(tmb username)
              res.redirect('/user/logout');
            });
        } else {
          req.flash('error', 'Incorrect password');
          res.redirect(`/user/${user}/update`);
        }
      }
    })
    .catch(next);
});

router.post('/:id/delete', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  User.findByIdAndDelete({ _id: user })
    .then(() => {
      console.log('User deleted');
      req.flash('info', 'User deleted');
      res.redirect('/signup');
      req.session.destroy();
    })
    .catch(next);
});
// done

module.exports = router;
