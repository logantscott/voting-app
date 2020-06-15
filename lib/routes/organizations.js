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

  // search for organizations or get all organizations
  .get('/', (req, res, next) => {
    Organization
      .find(req.query)
      .select({
        title: true,
        imageUrl: true
      })
      .then(organizations => res.send(organizations))
      .catch(next);
  })

  // get an organization by id
  .get('/:id', (req, res, next) => {
    req.query.members === 'true' 
      ? Organization
        .findOrgWithMembers(req.params.id)
        .then(organization => res.send(organization))
        .catch(next)
      : Organization
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
  .delete('/:id', async(req, res, next) => {
    Organization
      // .findByIdAndDelete(req.params.id)
      .deleteWithPollsAndVotes(req.params.id)
      .then(organization => res.send(organization))
      .catch(next);
  });
