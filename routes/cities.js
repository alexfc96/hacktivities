const express = require('express');
// const User = require('../models/User');
const City = require('../models/City');
const Hacktivity = require('../models/Hacktivity');

const router = express.Router();

router.get('/', (req, res, next) => {
  City.find()
    .then((city) => {
      res.render('cities/citylist', { city });
    })
    .catch(next);
});

router.get('/:_id', (req, res, next) => {
  const cityID = req.params;
  City.findById(cityID)
    .then((city) => {
      res.render('cities/city', {city});
      })
    .catch(next);
});


module.exports = router;
