function checkIfUserLoggedIn(req, res, next) {
  delete req.session.originalUrl;
  if (req.session.userLogged) {
    next();
  } else {
    // quedarme con la ruta para redirigir cuando se logee
    req.session.originalUrl = req.originalUrl;
    res.redirect('/login');
  }
}

function annonRoute(req, res, next) {
  if (req.session.userLogged) {
    res.redirect('/');
  } else {
    next();
  }
}


module.exports = {
  checkIfUserLoggedIn,
  annonRoute,
};
