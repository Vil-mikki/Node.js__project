const express = require('express');
const session = require('express-session'); 
const FileStore = require('session-file-store')(session);
const passport = require('passport');

const app = express();
const http = require('http').Server(app);

const host = 'localhost';
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'mySuperSecretKey123',
  store: new FileStore(),
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 1000
  },
  resave: false,
  saveUninitialized: false
}));

require('./config/passport-config');
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  console.log(req.session);
  res.send("I'm here!");
});

app.post('/auth',
  function (req, res, next) {
    passport.authenticate('local', {
      successRedirect: '/admin',
      failureRedirect: '/auth'
    }), function (error, user, info) {

      if (error) {
        return next(error);
      } 
      if (!user) {
        return res.status(401).send(info);
      } 

      req.logIn(user, function(err) {
        if(err) {
          return next(err);
        }
        return res.redirect('/admin')
      });
  }(req, res, next);
});

const auth = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
  } else {
    return res.redirect('/auth');
  }
};

app.get('/admin', auth, (req, res) => {
  res.send('Admin page!');
});

app.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

http.listen(port, host, () => console.log(`Server listens http://${host}:${port}`));