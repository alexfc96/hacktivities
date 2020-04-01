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
  const today = moment();
  const todayDate = today.format('YYYY-MM-DD');
  console.log(todayDate);
  const day = new Date(new Date().setDate(new Date().getDate()));
  Hacktivity.find({ date: { $lte: day }, hostId: user })
    .then((oldHacktivities) => {
      if (oldHacktivities && oldHacktivities.length === 0) {
        console.log("No tengo hacktivities caducadas");
        Hacktivity.find({ hostId: user })
          .then((hacktivity) => {
            console.log(hacktivity);
            checkuser.orderByDate(hacktivity);
            const current = checkuser.currentHacktivities(hacktivity);
            console.log(current);
            const expired = checkuser.expiredHacktivities(hacktivity);
            console.log(expired);
            res.render('user/my-hacktivities', {
              hacktivity, currentUser: req.session.userLogged, current, expired,
            });
          })
          // .catch(() => {
          //   res.render('user/my-hacktivities', { currentUser: req.session.userLogged });
          // });
      } else {
        Hacktivity.find({ date: { $gte: day }, hostId: user })
          .then((currentHacktivities) => {
            console.log("Tengo hacktivities caducadas");
            console.log(currentHacktivities);
            checkuser.orderByDate(currentHacktivities);
            console.log(oldHacktivities);
            checkuser.orderByDate(oldHacktivities);
            const current = checkuser.currentHacktivities(currentHacktivities);
            console.log(current);
            const expired = checkuser.expiredHacktivities(oldHacktivities);
            console.log(expired);
            res.render('user/my-hacktivities', {
              oldHacktivities, currentHacktivities, currentUser: req.session.userLogged, current, expired
            });
          })
          // .catch(() => {
          //   res.render('user/my-hacktivities', { currentUser: req.session.userLogged });
          // });
      }
    });


  // Hacktivity.find({ hostId: user })
  //   .then((hacktivity) => {
  //     console.log(hacktivity);
  //     checkuser.orderByDate(hacktivity);
  //     const current = checkuser.currentHacktivities(hacktivity);
  //     console.log(current);
  //     const expired = checkuser.expiredHacktivities(hacktivity);
  //     console.log(expired);
  //     //console.log(array);
  //     // const hacktivityDate = moment(hacktivity[2].date).format('YYYY-MM-DD');
  //     // console.log(hacktivityDate);
  //     res.render('user/my-hacktivities', { hacktivity, currentUser: req.session.userLogged, current, expired });
  //   })
  //   .catch(() => {
  //     res.render('user/my-hacktivities', { currentUser: req.session.userLogged });
  //   });
});

router.get('/my-bookings', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const user = req.session.userLogged._id;
  Booking.find({ atendees: { $in: [user] } })
    .populate('hacktivityId atendees')
    .then((booking) => {
      console.log(booking);
      checkuser.orderByDate(booking); // no acaba de ordenar ya que no se llegar a la lista hacktityId>date
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
