/* eslint-disable no-underscore-dangle */
const express = require('express');

const City = require('../models/City');
const Hacktivity = require('../models/Hacktivity');
const Booking = require('../models/Booking');

const router = express.Router();
const checkuser = require('../scripts/check');

const moment = require('moment');

/* GET /hacktivities */
router.get('/', (req, res, next) => {
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  Hacktivity.find({ date: { $gte: yesterday } })
    .then((hacktivities) => {
      checkuser.orderByDate(hacktivities);
      const date = checkuser.parseDate(hacktivities);
      //console.log(date);
      res.render('hacktivities/list', { date, hacktivities, currentUser: req.session.userLogged });
    })
    .catch((err) => console.log('Error while rendering Hacktivities: ', err));
});

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
    name, description, date, starthour, location, duration, created,
  } = req.body;
  const today = moment();
  const todayDate = today.format('YYYY-MM-DD');
  const checkDate = moment(date).format('YYYY-MM-DD');

  if (checkDate < todayDate) {
    req.flash('error', 'Specified date prior to today.');
    res.redirect('/hacktivities/create');
  } else if (duration > 10 && duration > 480) {
    req.flash('error', 'The maximum duration of the hacktivity is 480 minutes.');
    res.redirect('/hacktivities/create');
  } else {
    Hacktivity.create({
      hostId,
      name,
      description,
      date: checkDate,
      starthour,
      location,
      duration,
      created,
    })
      .then(() => {
        req.flash('info', 'The activity was created successfully');
        res.redirect('/hacktivities');
      })
      .catch(next);
  }
});

// GET HACKTIVITY BY ID
router.get('/:_id', (req, res, next) => {
  const hacktivityId = req.params;
  Hacktivity.findById(hacktivityId)
    .populate('location hostId')
    .then((hacktivity) => {
      let atendees = [];
      Booking.findOne({ hacktivityId })
        .populate('atendees')
        .then((booking) => {
          const date = checkuser.parseOneDate(hacktivity);
          if (booking == null) {
            res.render('hacktivities/hacktivity', {
              date, hacktivity, atendees, currentUser: req.session.userLogged,
            });
          } else {
            atendees = booking.atendees;
            console.log(atendees);
            res.render('hacktivities/hacktivity', {
              date, hacktivity, atendees, currentUser: req.session.userLogged,
            });
          }
        });
    })
    .catch((error) => {
      req.flash('info', 'We have not found this activity in the database.');
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
          req.flash('info', 'Successfully deleted.');
          res.redirect('/hacktivities');
        })
        .catch(next);
    })
    .catch(next);
});

// BOOK HACKTIVITIES
router.get('/:_id/book', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const hacktivityID = req.params;
  const user = req.session.userLogged._id;
  Booking.find({ hacktivityId: hacktivityID })
    .then((booking) => {
      if (booking && booking.length === 0) {
        Hacktivity.findById(hacktivityID)
          .then((hacktivity) => {
            Booking.create({
              hacktivityId: hacktivityID,
              hostId: hacktivity.hostId,
              atendees: user,
              date: hacktivity.date,
            })
              .then(() => {
                req.flash('info', 'You have successfully registered for the hacktivity.');
                res.redirect('/user/my-bookings');
              });
          });
      } else {
        Booking.findOne({ atendees: user })
          .then((subscribed) => {
            if (subscribed === null) {
              Booking.findOneAndUpdate({ hacktivityId: hacktivityID },
                { $push: { atendees: user } })
                .then(() => {
                  req.flash('info', 'You have successfully registered for the hacktivity.');
                  res.redirect('/user/my-bookings');
                })
                .catch(next);
            } else {
              req.flash('info', 'You are already subscribed in this hacktivity.');
              res.redirect('/user/my-bookings');
            }
          })
          .catch(() => {
          });
      }
    })
    .catch(next);
});

// DELETE BOOKING HACKTIVITIES
router.post('/:_id/deletebook', (req, res, next) => {
  const hacktivityId = req.params;
  const user = req.session.userLogged._id;

  Booking.findOneAndUpdate({ hacktivityId },
    { $pull: { atendees: user } })
    .then((booking) => {
      Booking.findOne({ hacktivityId })
        .then((book) => {
          if (book.atendees.length === 0) {
            Booking.findOneAndRemove({ hacktivityId })
              .then(() => {
                req.flash('info', 'You have successfully unsubscribed from the hacktivity.');
                res.redirect('/user');
              });
          } else {
            req.flash('info', 'You have successfully unsubscribed from the hacktivity.');
            res.redirect('/user');
          }
        });
    });
});

module.exports = router;
