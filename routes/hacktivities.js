const express = require('express');
// const User = require('../models/User');
// const City = require('../models/City');
const Hactivity = require('../models/Hacktivity');


const router = express.Router();


/* GET /hacktivities */
router.get('/hacktivities', (req, res, next) => {
  Hactivity.find()
    .then(hacktivities => {
      res.render('hacktivities/list', { hacktivities });
    })
    .catch(err => console.log('Error while rendering Hacktivities: ', err));
});

// GET /hacktivities/create
router.get('/create', (req, res) => {
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
