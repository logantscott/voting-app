require('../data-helpers/data-helpers');
const { agent, prepare } = require('../data-helpers/data-helpers');
const mongoose = require('mongoose');

const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');
const Vote = require('../lib/models/Vote');

describe('organization routes', () => {
  // create an organization
  it('can create an organization', () => {
    return agent
      .post('/api/v1/organizations')
      .send({
        title: 'A New Org',
        description: 'this is a very cool org',
        imageUrl: 'placekitten.com/400/400'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'A New Org',
          description: 'this is a very cool org',
          imageUrl: 'placekitten.com/400/400',
          __v: 0
        });
      });
  });

  // get all organizations
  it('can get all organizations', async() => {
    const organizations = prepare(await Organization.find().select({ title: true, imageUrl: true }));

    return agent
      .get('/api/v1/organizations')
      .then(res => {
        expect(res.body).toEqual(organizations);
      });
  });

  // get a single organization by id
  it('can get a single organization by id', async() => {
    const organization = prepare(await Organization.findOne());

    return agent
      .get(`/api/v1/organizations/${organization._id}`)
      .then(res => {
        expect(res.body).toEqual(organization);
      });
  });

  // update a single organization by id
  it('can update a single organization by id', async() => {
    const organization = prepare(await Organization.findOne());

    return agent
      .patch(`/api/v1/organizations/${organization._id}`)
      .send({ description: 'this org kinda sucks' })
      .then(res => {
        expect(res.body).toEqual({
          ...organization,
          description: 'this org kinda sucks'
        });
      });
  });

  // delete a single organization by id
  it('can delete a single organization by id', async() => {
    const organization = prepare(await Organization.findOne());

    return agent
      .delete(`/api/v1/organizations/${organization._id}`)
      .then(res => {
        expect(res.body).toEqual(organization);
      });
  });

  it('can delete all associated polls of deleted organization', async() => {

    const organization = prepare(await Organization.findOne());

    const polls = prepare(await Poll.find({ organization: organization._id }))
      .map(poll => poll._id);

    return agent
      .delete(`/api/v1/organizations/${organization._id}`)
      .then(res => {
        expect(res.body).toEqual(organization);
        return Poll.find({ organization: organization._id });
      })
      .then(res => {
        expect(res).toEqual([]);
        return Vote.find().where('poll').in(polls);
      })
      .then(res => {
        expect(res).toEqual([]);
      });
  });

  it('can get an organization and all members of', async() => {
    const organization = prepare(await Organization.findOne());

    return agent
      .get(`/api/v1/organizations/${organization._id}?members=true`)
      .then(res => {
        expect(res.body).toEqual({
          ...organization,
          members: res.body.members.map(() => ({ 
            _id: expect.anything(),
            name: expect.any(String),
            imageUrl: expect.any(String)
          }))
        });
      });
  });
});
