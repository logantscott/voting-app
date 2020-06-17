const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Vote = require('../lib/models/Vote');
const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');

describe('vote routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let organization, poll, user;
  beforeEach(async() => {
    organization = await Organization.create({
      title: 'A New Org',
      description: 'this is a very cool org',
      imageUrl: 'placekitten.com/400/400'
    });

    user = await User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    });

    poll = await Poll.create({
      organization: organization._id,
      title: 'This is a new poll',
      description: 'I am the description of this poll',
      options: [
        { option: 'Option 1' },
        { option: 'Option 2' },
        { option: 'Option 3' },
        { option: 'Option 4' }
      ]
    });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  // create a new vote
  it('can create a vote', () => {
    return request(app)
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: user._id,
        option: poll.options[1].id
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: poll.options[1].id,
          __v: 0
        });
      });
  });

  // get all votes on a poll
  it('can get all votes on a poll', async() => {
    return Vote
      .create({
        poll: poll._id,
        user: user._id,
        option: poll.options[1]._id
      })
      .then(() => request(app)
        .get(`/api/v1/votes?poll=${poll.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: poll.options[1].id,
          __v: 0
        }]);
      });
  });

  // get all votes by a user
  it('can get all votes by a user', () => {
    return Vote
      .create({
        poll: poll._id,
        user: user._id,
        option: poll.options[1].id
      })
      .then(() => request(app)
        .get(`/api/v1/votes?user=${user.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: poll.options[1].id,
          __v: 0
        }]);
      });
  });

  // update a voted option
  it('can update a voted option', () => {
    return Vote
      .create({
        poll: poll._id,
        user: user._id,
        option: poll.options[1].id
      })
      .then(vote => request(app)
        .patch(`/api/v1/votes/${vote.id}`)
        .send({
          option: poll.options[2].id
        }))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: poll.options[2].id,
          __v: 0
        });
      });
  });

  it('can create vote, only vote once per user/poll combo', async() => {

    // apparently this helps make indexes work with mongo memory server
    Vote.ensureIndexes();

    await request(app)
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: user._id,
        option: poll.options[1].id
      })
      .then(res => res.body);

    await request(app)
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: user._id,
        option: poll.options[1].id
      })
      .then(res => res.body);

    return request(app)
      .get(`/api/v1/votes?poll=${poll.id}&user=${user.id}`)
      .then(res => expect(res.body).toEqual([{
        _id: expect.anything(),
        poll: poll.id,
        user: user.id,
        option: poll.options[1].id,
        __v: 0
      }]));
  });
});
