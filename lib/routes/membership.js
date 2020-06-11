const { Router } = require('express');
const Membership = require('../models/Membership');

module.exports = Router()
  // create a membership
  .post('/', (req, res, next) => {
    Membership
      .create(req.body)
      .then(membership => res.send(membership))
      .catch(next);
  })

  // search for memberships or get all memberships
  .get('/', (req, res, next) => {
    Membership
      .find(req.query)
      .then(memberships => res.send(memberships))
      .catch(next);
  })

  // delete a membership
  .delete('/:id', (req, res, next) => {
    Membership
      .findByIdAndDelete(req.params.id, req.body, { new: true })
      .then(membership => res.send(membership))
      .catch(next);
  });
