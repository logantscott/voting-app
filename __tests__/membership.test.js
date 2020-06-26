require('../data-helpers/data-helpers');
const { agent, prepare } = require('../data-helpers/data-helpers');
const mongoose = require('mongoose');

const Membership = require('../lib/models/Membership');
const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');
const Vote = require('../lib/models/Vote');
const Poll = require('../lib/models/Poll');

describe('membership routes', () => {

  let membership;
  beforeEach(async() => {
    membership = prepare(await Membership.findOne());
  });

  // create a new membership
  it('can create a membership', async() => {
    const user = await User.findOne();
    const organization = await Organization.findOne();

    return agent
      .post('/api/v1/memberships')
      .send({
        organization: organization._id,
        user: user._id
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
          __v: 0
        });
      });
  });

  // get all users in an organization
  it('can get all user memberships in an organization', async() => {
    const memberships = prepare(await Membership.find({ organization: membership.organization })
      .populate('organization', { title: true, imageUrl: true })
      .populate('user', { name: true, imageUrl: true }));

    return agent
      .get(`/api/v1/memberships?organization=${membership.organization}`)
      .then(res => {
        expect(res.body).toEqual(memberships);
      });
  });

  // get all organizations a user is part of
  it('can get all organization memberships a user is part of', async() => {
    const memberships = prepare(await Membership.find({ user: membership.user })
      .populate('organization', { title: true, imageUrl: true })
      .populate('user', { name: true, imageUrl: true }));

    return agent
      .get(`/api/v1/memberships?user=${membership.user}`)
      .then(res => {
        expect(res.body).toEqual(memberships);
      });
  });

  // delete a membership
  it('can delete a membership', () => {
    return agent
      .delete(`/api/v1/memberships/${membership._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: membership.organization,
          user: membership.user,
          __v: 0
        });
      });
  });

  // delete a membership and all votes by user
  it('can delete a membership and all votes by user', async() => {

    const polls = prepare(await Poll.find({ organization: membership.organization }))
      .map(poll => poll._id);
    
    return agent
      .delete(`/api/v1/memberships/${membership._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: membership._id,
          organization: membership.organization,
          user: membership.user,
          __v: 0 // break until seed is fully udpated
        });

        return Vote.find({ user: membership.user, poll: { $in: polls } })
          .then(res => expect(res).toEqual([]));
      });
  });
});
