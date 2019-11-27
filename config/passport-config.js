const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const _ = require('lodash');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('dbUsers.json')
const usersDb = low(adapter);

passport.serializeUser(function (user, done) {
    console.log('Сериализация: ', user)
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    console.log('Десериализация: ', id);
    let user = _.find(usersDb.get('users').value(), { id: id });
    done(null, user);
});

passport.use(new LocalStrategy({
    userNameField: 'name',
    passwordField: 'password'
}, function (userName, password, done) {
    let user = _.find(usersDb.get('users').value(), { name: userName });
    console.log("I'm in passport-config");
    if (user === undefined || user.password !== password) {
        return done(null, false, "The email address and password you entered don't match any account. Please try again.");
    } else {
        return done(null, user);
    }
}
));