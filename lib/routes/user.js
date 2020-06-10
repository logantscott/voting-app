const { Router } = require('express');
const User = require('../models/User');

module.exports = Router()
  // create user
  .post('/', (req, res, next) => {
    console.log('Create User');
    User
      .create(req.body)
      .then(user => res.send(user))
      .catch(next);
  })

  // search for users
  .get('/', (req, res, next) => {
    console.log('VOTE');
    User
      .find(req.query)
      .select({
        name: true
      })
      .then(users => res.send(users))
      .catch(next);
  })

  // get one user
  .get('/:id', (req, res, next) => {
    User
      .findById(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  });
