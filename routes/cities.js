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
  Hacktivity.find({ location: cityID })
    .populate('location')  //como sacar los datos de la location?
    .then((city) => {
			// const { resort_id: resort } = reviews[0];
			// res.render('resorts/update', { resort, reviews });

      const {location: data} = city[0];
      console.log(data);
      res.render('cities/city', { city, data });

      // console.log(city);
      // res.render('cities/city', { city });
      })
    .catch(next);
});


module.exports = router;
