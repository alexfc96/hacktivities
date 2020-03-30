function checkIfUserLoggedIn(req, res, next) {
  delete req.session.originalUrl;
  if (req.session.userLogged) {
    next();
  } else {
    // quedarme con la ruta para redirigir cuando se logee
    console.log(req.originalUrl);
    req.session.originalUrl = req.originalUrl;
    res.redirect('/login');
  }
}

//el flujo es quiere hacer booking. comprobamos si está loggued, si no lo está guardamos su pagina y lo mandamos al login
//después de que entre hay q reedigirlo

function returnToTheLastPage(req, res, next) { // lohe llamado en el post del login pero no funciona
  // delete req.session.originalUrl;
  if (req.session.userLogged) {
    console.log(req.session.originalUrl);
    res.redirect(req.session.originalUrl);
  } else {
    next();
  }
}
// y en el caso de que le mandemos a login pero haga un signup?

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

// cargar aqui mensajes de flash y luego en la ruta

module.exports = {
  checkIfUserLoggedIn,
  isValueInvalid,
  returnToTheLastPage,
  annonRoute,
};
