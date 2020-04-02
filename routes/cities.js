const express = require('express');
// const User = require('../models/User');
const City = require('../models/City');
const Hacktivity = require('../models/Hacktivity');

const checkuser = require('../scripts/check');
const moment = require('moment');

const router = express.Router();

router.get('/', (req, res, next) => {
  City.find()
    .then((city) => {
      res.render('cities/citylist', { city, currentUser: req.session.userLogged });
    })
    .catch(next);
});

router.get('/:_id', (req, res, next) => {
  const cityID = req.params;
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  Hacktivity.find({ date: { $gte: yesterday }, location: cityID })
    .then((hacktivities) => {
      checkuser.orderByDate(hacktivities);
      City.findById(cityID)
        .then((city)=>{
          res.render('cities/city', { hacktivities, city, currentUser: req.session.userLogged });
        })
        .catch(next);
    })
    .catch(next);
});


module.exports = router;
