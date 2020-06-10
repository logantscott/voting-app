const { Router } = require('express');
const Organization = require('../models/Organization');

module.exports = Router()

  // search for orgs
  .get('/', (req, res, next) => {
    console.log('ORG');
    Organization
      .find(req.query)
      .select({
        name: true
      })
      .then(organizations => res.send(organizations))
      .catch(next);
  });
