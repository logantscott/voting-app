require('../data-helpers/data-helpers');
const { agent, prepare } = require('../data-helpers/data-helpers');
const mongoose = require('mongoose');
const chance = require('chance').Chance();

const Vote = require('../lib/models/Vote');
const User = require('../lib/models/User');
const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');

describe('vote routes', () => {
  // create a new vote
  it('can create a vote', async() => {
    const organization = prepare(await Organization.findOne());
    const poll = prepare(await Poll.create({
      organization: organization._id,
      title: chance.sentence() + '?',
      description: chance.sentence(),
      options: [
        { option: chance.animal() },
        { option: chance.animal() },
        { option: chance.animal() },
        { option: chance.animal() }
      ]
    }));
    const user = prepare(await User.findOne());

    return agent
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: user._id,
        option: poll.options[1]._id
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll._id,
          user: user._id,
          option: poll.options[1]._id,
          __v: 0
        });
      });
  });

  // get all votes on a poll
  it('can get all votes on a poll', async() => {
    const poll = prepare(await Poll.findOne());
    const votes = prepare(await Vote.find({ poll: poll._id }));

    return agent
      .get(`/api/v1/votes?poll=${poll._id}`)
      .then(res => {
        expect(res.body).toEqual(votes);
      });
  });

  // get all votes by a user
  it('can get all votes by a user', async() => {
    const user = prepare(await User.findOne());
    const votes = prepare(await Vote.find({ user: user._id }));

    return agent
      .get(`/api/v1/votes?user=${user._id}`)
      .then(res => {
        expect(res.body).toEqual(votes);
      });
  });

  // update a voted option
  it('can update a voted option', async() => {
    const poll = prepare(await Poll.findOne());
    const vote = prepare(await Vote.findOne({ poll: poll._id }));
    const newOption = prepare(mongoose.Types.ObjectId());

    return agent
      .patch(`/api/v1/votes/${vote._id}`)
      .send({
        option: newOption
      })
      .then(res => {
        expect(res.body).toEqual({
          ...vote,
          option: newOption
        });
      });
  });

  it('can create vote, only vote once per user/poll combo', async() => {
    // apparently this helps make indexes work with mongo memory server
    Vote.ensureIndexes();
    const poll = prepare(await Poll.findOne());
    const user = prepare(await User.findOne());

    await agent
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: user._id,
        option: poll.options[1]._id
      })
      .then(res => res.body);

    await agent
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: user._id,
        option: poll.options[1]._id
      })
      .then(res => res.body);

    return agent
      .get(`/api/v1/votes?poll=${poll._id}&user=${user._id}`)
      .then(res => expect(res.body).toEqual([{
        _id: expect.anything(),
        poll: poll._id,
        user: user._id,
        option: poll.options[1]._id,
        __v: 0
      }]));
  });
});
