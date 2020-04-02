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
  // console.log(user)
  User.findById(user)
    .then((currentUser) => {
      res.render('user/profile', { currentUser });
    })
    .catch(next);
});

router.get('/my-hacktivities', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  const today = new Date(new Date().setDate(new Date().getDate()));
  Hacktivity.find({ date: { $lte: today }, hostId: user })
    .then((oldHacktivities) => {
      if (oldHacktivities && oldHacktivities.length === 0) { // buscamos si no tiene actividades caducadas, entonces:
        Hacktivity.find({ hostId: user }) // mostramos todas
          .then((currentHacktivities) => {
            console.log(currentHacktivities);
            if (currentHacktivities && currentHacktivities.length === 0) {
              const without = 'User wiwthout hacktivities';
              res.render('user/my-hacktivities', { currentUser: req.session.userLogged, without });
            } else {
              checkuser.orderByDate(currentHacktivities);
              const current = checkuser.currentHacktivities(currentHacktivities);
              console.log(current);
              res.render('user/my-hacktivities', {
                currentHacktivities, currentUser: req.session.userLogged, current,
              });
            }
          });
      } else {
        Hacktivity.find({ date: { $gte: today }, hostId: user }) // en caso de que tenga también buscaremos las mayores a hoy.
          .then((currentHacktivities) => { // creo que falta comparar si es hoy para que tmb las muestre
            console.log('Tengo hacktivities caducadas');
            console.log(currentHacktivities);
            checkuser.orderByDate(currentHacktivities);
            console.log(oldHacktivities);
            checkuser.orderByDate(oldHacktivities);
            const current = checkuser.currentHacktivities(currentHacktivities);
            console.log(current);
            const expired = checkuser.expiredHacktivities(oldHacktivities);
            console.log(expired);
            res.render('user/my-hacktivities', {
              oldHacktivities, currentHacktivities, currentUser: req.session.userLogged, current, expired,
            });
          });
      }
    })
    .catch(() => {
      console.log('entro');
      const without = 'User wiwthout hacktivities';
      res.render('user/my-hacktivities', { currentUser: req.session.userLogged, without });
    });
});

router.get('/my-bookings', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  const today = new Date(new Date().setDate(new Date().getDate()));
  Booking.find({ atendees: { $in: [user] } })
    .populate('hacktivityId atendees')
    .then((booking) => {
      console.log(booking);
      // checkuser.orderByDate(booking);
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
      Hacktivity.find({ hostId: userId })
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
