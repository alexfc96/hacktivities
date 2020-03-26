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
router.get('/', checkuser.annonRoute, (req, res, next) => {
  Hacktivity.find()
    .then((hacktivities) => {
      res.render('hacktivities/list', { hacktivities });
    })
    .catch((err) => console.log('Error while rendering Hacktivities: ', err));
});

// router.use(checkuser.checkIfUserLoggedIn); // limita a visualizar las rutas a los no logueados

// GET /hacktivities/create
router.get('/create', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  City.find()
    .then((city) => {
      res.render('hacktivities/create', { city });
    })
    .catch(next);
});

// POST /hacktivities
router.post('/create', (req, res, next) => {
  const hostId = req.session.userLogged._id;
  const {
    name, description, date, location, duration, created,
  } = req.body;
  checkDate = new Date(date);
  const todayDate = new Date();
  if (checkDate < todayDate) {
    res.render('hacktivities/create', { error: 'Fecha anterior a hoy' }); // hacer flash
  } else if (duration > 480) {
    res.render('hacktivities/create', { error: 'La duración maxima dela activadad son 480mins' }); // hacer flash
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
    .populate('location  host')
    .then((hacktivity) => {
      res.render('hacktivities/hacktivity', { hacktivity, userId });
    })
    .catch((hacktivity) => {
      res.render('hacktivities/hacktivity', { hacktivity });
    });
});
// GET HACKTIVITY UPDATE
router.get('/:_id/update', checkuser.checkIfUserLoggedIn, (req, res) => {
  const hacktivityID = req.params;

  Hacktivity.findById(hacktivityID)
    .then((hacktivity) => {
      res.render('hacktivities/update', { hacktivity });
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
      } else {
        Booking.findOneAndUpdate({ hacktivityId: hacktivityID }, 
          { $push: { atendees: user } },
          function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log(success);
            }
        }
          );
      }
      res.redirect('/');
    })
    .catch(next);

  // 0º - Compruebo que no haya un booking para esa actividad
  // 1º - Me devuelve un booking -> update ese booking haciendo pushen atendees de user
  // 2º - No me devuelve nada -> findbyid de hacktivity
  // 3º - Crear un booking para esa actividad, y añadir el user a atendees
});

module.exports = router;
