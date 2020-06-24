const { Router } = require('express');
const Poll = require('../models/Poll');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()

  // create a new poll
  .post('/', ensureAuth, (req, res, next) => {
    Poll
      .create(req.body)
      .then(poll => res.send(poll))
      .catch(next);
  })

  // get all polls or search polls
  .get('/', ensureAuth, (req, res, next) => {
    Poll
      .find(req.query)
      .select({
        title: true
      })
      .then(polls => res.send(polls))
      .catch(next);
  })

  // get details of a poll by id
  .get('/:id', ensureAuth, (req, res, next) => {
    Poll
      .findById(req.params.id)
      // get total votes how??
      .populate('organization')
      .populate('votes')
      .then(poll => res.send(poll))
      .catch(next);
  })

  // update a polls title or description
  .patch('/:id', ensureAuth, (req, res, next) => {
    Poll
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(poll => res.send(poll))
      .catch(next);
  })

  // delete a poll
  .delete('/:id', ensureAuth, (req, res, next) => {
    Poll
      //.findByIdAndDelete(req.params.id)
      .deleteWithVotes(req.params.id)
      .then(poll => res.send(poll))
      .catch(next);
  });
