const express = require('express');
// const User = require('../models/User');
const City = require('../models/City');
const Hacktivity = require('../models/Hacktivity');

const checkuser = require('../scripts/check');

const router = express.Router();

router.get('/', (req, res, next) => {
  City.find()
    .then((city) => {
      res.render('cities/citylist', { city });
    })
    .catch(next);
});

router.get('/:_id', checkuser.checkIfUserLoggedIn, (req, res, next) => {
  const cityID = req.params;
  Hacktivity.find({ location: cityID })
    //.populate('location')    no hace falta!
    .then((hacktivities) => {
      City.findById(cityID)
        .then((city)=>{
          res.render('cities/city', { hacktivities, city });
        })
        .catch(next);
    })
    .catch(next);
});


module.exports = router;
