const { Router } = require('express');
const User = require('../models/User');

module.exports = Router()
  // create user
  .post('/', (req, res, next) => {
    User
      .create(req.body)
      .then(user => res.send(user))
      .catch(next);
  })

  // search for users
  .get('/', (req, res, next) => {
    User
      .find(req.query)
      .select({
        name: true
      })
      .then(users => res.send(users))
      .catch(next);
  })

  // get a user
  .get('/:id', (req, res, next) => {
    User
      .findById(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  })

  // update a user
  .patch('/:id', (req, res, next) => {
    User
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(user => res.send(user))
      .catch(next);
  })

  // delete a user
  .delete('/:id', (req, res, next) => {
    User
      .findByIdAndDelete(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  });
