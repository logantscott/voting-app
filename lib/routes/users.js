const { Router } = require('express');
const User = require('../models/User');
const ensureAuth = require('../middleware/ensureAuth');

const setCookie = (user, res) => {
  res.cookie('session', user.authToken(), {
    maxAge: 1000 * 60 * 60 * 24, // 1000 * 60 * 60 * 24 = 1 day
    httpOnly: true
  });
};

module.exports = Router()
  // create user
  .post('/signup', (req, res, next) => {
    User
      .create(req.body)
      .then(user => {
        setCookie(user, res);
        res.send(user);
      })
      .catch(next);
  })

  // login user
  .post('/login', (req, res, next) => {
    User
      .authorize(req.body.email, req.body.password)
      .then(user => {
        setCookie(user, res);
        res.send(user);
      })
      .catch(next);
  })

  // verify user
  .get('/verify', ensureAuth, (req, res) => {
    res.send(req.user);
  })

  // search for users or get all users
  .get('/', ensureAuth, (req, res, next) => {
    User
      .find(req.query)
      .select({
        name: true
      })
      .then(users => res.send(users))
      .catch(next);
  })

  // get a user by id
  .get('/:id', ensureAuth, (req, res, next) => {
    req.query.organizations === 'true' 
      ? User
        .findUserWithOrganizations(req.params.id)
        .then(user => res.send(user))
        .catch(next)
      : User
        .findById(req.params.id)
        .then(user => res.send(user))
        .catch(next);
  })

  // update a user
  .patch('/:id', ensureAuth, (req, res, next) => {
    User
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(user => res.send(user))
      .catch(next);
  })

  // delete a user
  .delete('/:id', ensureAuth, (req, res, next) => {
    User
      .findByIdAndDelete(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  });
