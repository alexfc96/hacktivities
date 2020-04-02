const moment = require('moment');

function checkIfUserLoggedIn(req, res, next) {
  delete req.session.originalUrl;
  if (req.session.userLogged) {
    next();
  } else {
    req.session.originalUrl = req.originalUrl;
    res.redirect('/login');
  }
}

function returnToTheLastPage(req, res, next) { 
  // delete req.session.originalUrl;
  if (req.session.userLogged) {
    if (req.session.originalUrl === undefined) {
      res.redirect('/');
    } else {
      res.redirect(req.session.originalUrl);
    }
  } else {
    next();
  }
}

function annonRoute(req, res, next) {
  if (req.session.userLogged) {
    res.redirect('/');
  } else {
    next();
  }
}

function isValueInvalid(input) {
  return input === '' || input === undefined;
}

function parseOneDate(array) {
  const date = moment(array.date).format('YYYY-MM-DD');
  return date;
}

function parseDate(array) {
  const date = [];
  for (let i = 0; i < array.length; i++) {
    const dates = moment(array[i].date).format('YYYY-MM-DD');
    date.push(dates);
  }
  return date;
}

function currentHacktivities(array) {
  const dates = [];
  let cont = 0;
  const today = moment();
  const todayDate = today.format('YYYY-MM-DD');
  for (let i = 0; i < array.length; i++) {
    const date = moment(array[i].date).format('YYYY-MM-DD');
    dates.push(date);
    if (todayDate > date) {
      cont += 1;
    }
  }
  dates.splice(0, cont);
  return dates;
}

function expiredHacktivities(array) {
  const dates = [];
  let cont = 0;
  const today = moment();
  const todayDate = today.format('YYYY-MM-DD');
  for (let i = 0; i < array.length; i++) {
    const date = moment(array[i].date).format('YYYY-MM-DD');
    dates.push(date);
    if (todayDate > date) {
      cont += 1;
    }
  }
  const expired = dates.splice(0, cont);
  // console.log("La lista final de dates correctas" + dates);
  // console.log("La lista final de dates expiradas" + expired);
  return expired;
}

function orderByDate(array) {
  array.sort((a, b) => {
    a = new Date(a.date);
    b = new Date(b.date);
    return a > b ? 1 : a < b ? -1 : 0;
  });
}

module.exports = {
  checkIfUserLoggedIn,
  isValueInvalid,
  parseOneDate,
  parseDate,
  currentHacktivities,
  expiredHacktivities,
  returnToTheLastPage,
  annonRoute,
  orderByDate,
};
