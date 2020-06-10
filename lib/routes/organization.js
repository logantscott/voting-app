const { Router } = require('express');
const Organization = require('../models/Organization');

module.exports = Router()

  // create an organization
  .post('/', (req, res, next) => {
    Organization
      .create(req.body)
      .then(organization => res.send(organization))
      .catch(next);
  })

  // search for organizations
  .get('/', (req, res, next) => {
    Organization
      .find(req.query)
      .select({
        name: true
      })
      .then(organizations => res.send(organizations))
      .catch(next);
  })

  // get an organization
  .get('/:id', (req, res, next) => {
    Organization
      .findById(req.params.id)
      .then(organization => res.send(organization))
      .catch(next);
  })

  // update an organization
  .patch('/:id', (req, res, next) => {
    Organization
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(organization => res.send(organization))
      .catch(next);
  })

  // delete an organization
  .delete('/:id', (req, res, next) => {
    Organization
      .findByIdAndDelete(req.params.id)
      .then(organization => res.send(organization))
      .catch(next);
  });
