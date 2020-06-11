const { Router } = require('express');
const Poll = require('../models/Poll');

module.exports = Router()

  // create a new poll
  .post('/', (req, res, next) => {
    Poll
      .create(req.body)
      .then(poll => res.send(poll))
      .catch(next);
  });
