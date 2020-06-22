const { Router } = require('express');
const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

module.exports = Router()

  // create a new poll
  .post('/', (req, res, next) => {
    Poll
      .create(req.body)
      .then(poll => res.send(poll))
      .catch(next);
  })

  // get all polls or search polls
  .get('/', (req, res, next) => {
    Poll
      .find(req.query)
      .select({
        title: true
      })
      .then(polls => res.send(polls))
      .catch(next);
  })

  // get details of a poll by id
  .get('/:id', (req, res, next) => {
    Poll
      .findById(req.params.id)
      // get total votes how??
      .populate('organization')
      .populate('votes')
      .then(poll => res.send(poll))
      .catch(next);
  })

  // update a polls title or description
  .patch('/:id', (req, res, next) => {
    Poll
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(poll => res.send(poll))
      .catch(next);
  })

  // delete a poll
  .delete('/:id', (req, res, next) => {
    Poll
      //.findByIdAndDelete(req.params.id)
      .deleteWithVotes(req.params.id)
      .then(poll => res.send(poll))
      .catch(next);
  });