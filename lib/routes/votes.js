const { Router } = require('express');
const Vote = require('../models/Vote');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()
  // create a vote
  .post('/', ensureAuth, (req, res, next) => {
    try {
      Vote
        .create(req.body)
        .then(vote => res.send(vote))
        .catch(next);
    } catch(err) {
      console.log(err);
    }
  })

  // search for votes or get all votes
  .get('/', ensureAuth, (req, res, next) => {
    Vote
      .find(req.query)
      .then(votes => res.send(votes))
      .catch(next);
  })

  // update a vote
  .patch('/:id', ensureAuth, (req, res, next) => {
    Vote
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(vote => res.send(vote))
      .catch(next);
  });
