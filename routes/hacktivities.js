const express = require('express');
// const User = require('../models/User');
// const City = require('../models/City');
const Hacktivity = require('../models/Hacktivity');

const router = express.Router();


/* GET /hacktivities */
router.get('/', (req, res, next) => {
  Hacktivity.find()
    .then(hacktivity => {
      res.render('hacktivities/list', { hacktivity });
    })
    .catch(err => console.log('Error while rendering Hacktivities: ', err));
});

// GET /hacktivities/create
router.get('/create', (req, res) => {
  res.render('hacktivities/create');
});

// POST /hacktivities
router.post('/create', (req, res, next) => {
  const { host, name, description, date, location, duration, created } = req.body; 
  Hacktivity.create({
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

router.get('/:id', (req, res, next) => {
  const hacktivityID = req.params;
  console.log(hacktivityID);
  Hacktivity.findById(hacktivityID)
  .then((hacktivity) => {
    res.render('/hacktivities/hacktivity', {hacktivity})
  })
  .catch(next)
})

module.exports = router;
