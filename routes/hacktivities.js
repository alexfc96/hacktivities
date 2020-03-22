const express = require('express');
// const User = require('../models/User');
const City = require('../models/City');
const Hacktivity = require('../models/Hacktivity');

const router = express.Router();
const checkuser = require('../scripts/checkuserlogged');

/* GET /hacktivities */
router.get('/', (req, res, next) => {
//  const user = req.session.userLogged._id;

  Hacktivity.find()
    .then(hacktivities => {
      res.render('hacktivities/list', { hacktivities });
    })
    .catch(err => console.log('Error while rendering Hacktivities: ', err));
});

router.use(checkuser.checkIfUserLoggedIn); //limita a visualizar las rutas a los no logueados

// GET /hacktivities/create
router.get('/create', (req, res, next) => {
  City.find()
    .then((city) =>{
      res.render('hacktivities/create', {city});
    })
    .catch(next);
});

// POST /hacktivities
router.post('/create', (req, res, next) => {
  const host = req.session.userLogged._id;
  const { name, description, date, location, duration, created } = req.body;
  checkDate = new Date(date)
  const todayDate = new Date();
  if (checkDate < todayDate) {
    res.render('hacktivities/create', {error: "Fecha anterior a hoy"}) //hacer flash
 } else if (duration > 480) {
    res.render('hacktivities/create', {error: "La duración maxima dela activadad son 480mins"}) //hacer flash
 } else{
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
 }

});
// GET HACKTIVITY BY ID
router.get('/:_id', (req, res, next) => {
  const hacktivityID = req.params;
  const user = req.session.userLogged._id;

  Hacktivity.findById(hacktivityID)
    // .populate({ path: 'location', select: 'name' })
    .populate('location')
    .then((hacktivity) => {
      res.render('hacktivities/hacktivity', { hacktivity, user });
    })
    .catch(() =>{
    res.render('hacktivities/hacktivity', { hacktivity });
    });
});
// GET HACKTIVITY UPDATE
router.get('/:_id/update',(req, res) =>{
  const hacktivityID = req.params;

  Hacktivity.findById(hacktivityID)
    .then((hacktivity) => {
      res.render('hacktivities/update', { hacktivity });
    })
    .catch(err => console.log('Error while rendering Hacktivities: ', err));
});
// POST HACKTIVITY UPDATE

router.post('/:_id/update', (req, res, next) => {
  const hacktivityID = req.params;
  const { name, description, date, duration } = req.body;
  Hacktivity.findByIdAndUpdate(hacktivityID, {
    name,
    description,
    date,
    duration,
  })
    .then((hacktivityUpdated) => {
      res.redirect(`/hacktivities/${hacktivityID._id}`);
    })
    .catch(next);
});

// DELETE HACKTIVITIES
router.post('/:_id/delete', (req, res, next) => {
  const hacktivityID = req.params;

  Hacktivity.findByIdAndDelete(hacktivityID) 
    .then(() => {
      res.redirect('/hacktivities');
    })
    .catch(next);
});

module.exports = router;

