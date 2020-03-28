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
  const hacktivityId = req.params;
  const userId = req.session.userLogged._id;

  // revisar que el user no registrado entonces solo nos diga el length de numeros de atendees
  Hacktivity.findById(hacktivityId)
    .populate('location hostId')
    .then((hacktivity) => {
      // console.log(hacktivity);
      let atendees = [];
      Booking.findOne({ hacktivityId })
        .populate('atendees')
        .then((booking) => {
          if (booking == null) {
            res.render('hacktivities/hacktivity', { hacktivity, userId, atendees });
          } else {
          // console.log(booking);
            atendees = booking.atendees;
            console.log(atendees);
            res.render('hacktivities/hacktivity', { hacktivity, userId, atendees });
          }
        })
      // res.render('hacktivities/hacktivity', { hacktivity, userId, atendees });
    })
    .catch((error) => {
      req.flash('info','We have not found this activity in the database.');
      res.redirect('/hacktivities');
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
          req.flash('info','Successfully deleted.');
          res.redirect('/hacktivities');
        })
        .catch(next);
    })
    .catch(next);
});

// BOOK HACKTIVITIES
router.post('/:_id/book', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const hacktivityID = req.params;
  console.log(hacktivityID);
  const user = req.session.userLogged._id;

  Booking.find({ hacktivityId: hacktivityID })
    .then((booking) => {
      if (booking.length === 0) {
        Hacktivity.findById(hacktivityID)
          .then((hacktivity) => {
            Booking.create({
              hacktivityId: hacktivityID,
              hostId: hacktivity.hostId,
              atendees: user,
            })
              .then(() => {
                req.flash('info','You have successfully registered for the hacktivity.');
                res.redirect('/user');
              });
          });
      } else {
        Booking.findOne({ atendees: user })
          .then((subscribed)=>{
            console.log("Usuario ya suscrito");
            console.log(subscribed);
            req.flash('error','You are already subscribed in this hacktivity.');
            res.redirect('/user');
          })
          .catch(()=>{
            Booking.findOneAndUpdate({ hacktivityId: hacktivityID },
              { $push: { atendees: user } })
              .then(() => {
                req.flash('info','You have successfully registered for the hacktivity.');
                res.redirect('/user');
              })
              .catch(next);
          });
      }
      //res.redirect('/user');  //no poner porque si no salta el primero(asincrono)
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
      req.flash('info','You have successfully unsubscribed from the hacktivity.');
      res.redirect('/user');
    })
    .catch(next);
});

module.exports = router;