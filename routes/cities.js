const express = require('express');
const User = require('../models/User');
const City = require('../models/City');
const Hactivity = require('../models/Hacktivity');


const router = express.Router();


/* GET /hacktivities */
router.get('/', (req, res, next) => {
  const { currentUser } = req.session;
  City.find()
    .then((cities) => {
      res.render('hacktivities/list', {
        cities,
        currentUser,
      });
    })
    .catch(next);
});

// GET /hacktivities/add
router.get('/add', (req, res) => {
  res.render('hacktivities/create');
});

// POST /hacktivities
router.post('/', (req, res, next) => {
  const { host, name, description, date, location, duration, created } = req.body; 
  Hactivity.create({
    host,
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
});

module.exports = router;
