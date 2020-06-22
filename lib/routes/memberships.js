const { Router } = require('express');
const Membership = require('../models/Membership');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()
  // create a membership
  .post('/', ensureAuth, (req, res, next) => {
    Membership
      .create(req.body)
      .then(membership => res.send(membership))
      .catch(next);
  })

  // search for memberships or get all memberships
  .get('/', ensureAuth, (req, res, next) => {
    Membership
      .find(req.query)
      .populate('organization', { title: true, imageUrl: true })
      .populate('user', { name: true, imageUrl: true })
      .then(memberships => res.send(memberships))
      .catch(next);
  })

  // delete a membership
  .delete('/:id', ensureAuth, (req, res, next) => {
    Membership
      //.findByIdAndDelete(req.params.id)
      .deleteWithVotesByUser(req.params.id)
      .then(membership => res.send(membership))
      .catch(next);
  });
