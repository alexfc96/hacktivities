const express = require('express');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

// const User = require('../models/User');
const City = require('../models/City');
const Hacktivity = require('../models/Hacktivity');
const Booking = require('../models/Booking');

const router = express.Router();
const checkuser = require('../scripts/check');

/* GET /hacktivities */
router.get('/', (req, res, next) => {
  Hacktivity.find()
    .then((hacktivities) => {
      res.render('hacktivities/list', { hacktivities, currentUser: req.session.userLogged });
    })
    .catch((err) => console.log('Error while rendering Hacktivities: ', err));
});

// router.use(checkuser.checkIfUserLoggedIn); // limita a visualizar las rutas a los no logueados

// GET /hacktivities/create
router.get('/create', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  City.find()
    .then((city) => {
      res.render('hacktivities/create', { city, currentUser: req.session.userLogged });
    })
    .catch(next);
});

// POST /hacktivities
router.post('/create', (req, res, next) => {
  const hostId = req.session.userLogged._id;
  const {
    name, description, date, location, duration, created,
  } = req.body;
  const checkDate = new Date(date);
  const todayDate = new Date();
  if (checkDate < todayDate) {
    req.flash('dateError','Specified date prior to today.');
    res.redirect('/hacktivities/create');
  } else if (duration > 480) {
    req.flash('timeError','The maximum duration of the hacktivity is 480 minutes.');
    res.redirect('/hacktivities/create');
  } else {
    Hacktivity.create({
      hostId,
      name,
      description,
      date,
      location,
      duration,
      created,
    })
      .then(() => {
        req.flash('info','The activity was created successfully');
        res.redirect('/hacktivities');
      })
      .catch(next);
  }
});

// GET HACKTIVITY BY ID
router.get('/:_id', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const hacktivityID = req.params;
  const userId = req.session.userLogged._id;

  Hacktivity.findById(hacktivityID)
    // .populate({ path: 'location', select: 'name' })
    .populate('location')
    .populate('hostId')
    
    .then((hacktivity) => {
      console.log(hacktivity);
      res.render('hacktivities/hacktivity', { hacktivity, userId, currentUser: req.session.userLogged });
    })
    .catch((hacktivity) => {
      res.render('hacktivities/hacktivity', { hacktivity, currentUser: req.session.userLogged });
    });
});
// GET HACKTIVITY UPDATE
router.get('/:_id/update', checkuser.checkIfUserLoggedIn, (req, res) => {
  const hacktivityID = req.params;

  Hacktivity.findById(hacktivityID)
    .then((hacktivity) => {
      res.render('hacktivities/update', { hacktivity, currentUser: req.session.userLogged });
    })
    .catch((err) => console.log('Error while rendering Hacktivities: ', err));
});
// POST HACKTIVITY UPDATE

router.post('/:_id/update', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const hacktivityID = req.params;
  const {
    name, description, date, duration,
  } = req.body;
  Hacktivity.findByIdAndUpdate(hacktivityID, {
    name,
    description,
    date,
    duration,
  })
    .then(() => {
      res.redirect(`/hacktivities/${hacktivityID._id}`);
    })
    .catch(next);
});

// DELETE HACKTIVITIES
router.post('/:_id/delete', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const hacktivityID = req.params;

  Hacktivity.findByIdAndDelete(hacktivityID)
    .then(() => {
      Booking.findOneAndDelete({ hacktivityId: hacktivityID })
        .then(() => {
          console.log('Borrado con exito');
        })
        .catch(next);
      res.redirect('/hacktivities');
    })
    .catch(next);
});

// BOOK HACKTIVITIES
// hacer que cuando se cree una actividad se cree su modelo booking?
// y luego aquí solo hacer un findandupdate pusheando el atendee?
router.post('/:_id/book', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const hacktivityID = req.params;
  console.log(hacktivityID);
  const user = req.session.userLogged._id;

  Booking.find({ hacktivityId: hacktivityID })
    .then((booking) => {
      if (booking && booking.length == 0) {
        Hacktivity.findById(hacktivityID)
          .then((hacktivity) => {
            Booking.create({
              hacktivityId: hacktivityID,
              hostId: hacktivity.hostId,
              atendees: user,
            });
          });
      // } else if (Booking.findOne({ atendees: user })) {  //aqui busco en todos. Tengo que buscar en el id en cuestion
      //   Booking.findOne({ atendees: user })
      //     .then(() => {
      //       console.log('Already registered in that hacktivity');
      //       res.redirect('/user', { error: 'You are already registered in that hacktivity' });
      //     })
      //     .catch(next);
      } else {
        Booking.findOneAndUpdate({ hacktivityId: hacktivityID },
          { $push: { atendees: user } })
          .then(() => {
            res.redirect('/user', { success: 'You have successfully registered for the hacktivity.' });
          })
          .catch(next);
      }
      res.redirect('/user');  //si no dejamos este no redirecciona (los anteriores no son capaces)
    })
    .catch(next);
});

// DELETE BOOKING HACKTIVITIES
router.post('/:_id/deletebook', (req, res, next) => {
  const hacktivityID = req.params;
  console.log(hacktivityID);
  const user = req.session.userLogged._id;

  Booking.findOneAndUpdate({ atendees: user },
    { $pull: { atendees: user } })
    .then((booking) => {
      console.log(booking.atendees);
    })
    .catch(next);
  res.redirect('/user');
});

module.exports = router;