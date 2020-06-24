require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');
const Vote = require('../lib/models/Vote');
const User = require('../lib/models/User');

describe('poll routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let organization, user, agent;
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
      password: '1234',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    });

    agent = request.agent(app);

    await agent
      .post('/api/v1/users/login')
      .send({
        email: 'email@email.com',
        password: '1234'
      });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  // create a poll
  it('can create a poll', () => {
    return agent
      .post('/api/v1/polls')
      .send({
        organization: organization._id,
        title: 'This is a new poll',
        description: 'I am the description of this poll',
        options: [
          { option: 'Option 1' },
          { option: 'Option 2' },
          { option: 'Option 3' },
          { option: 'Option 4' }
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'This is a new poll',
          description: 'I am the description of this poll',
          options: [
            { _id: expect.anything(), option: 'Option 1' },
            { _id: expect.anything(), option: 'Option 2' },
            { _id: expect.anything(), option: 'Option 3' },
            { _id: expect.anything(), option: 'Option 4' }
          ],
          __v: 0
        });
      });
  });

  // get polls by organization
  it('can get polls by organization', () => {
    return Poll
      .create([{
        organization: organization._id,
        title: 'This is a new poll',
        description: 'I am the description of this poll',
        options: [
          { option: 'Option 1' },
          { option: 'Option 2' },
          { option: 'Option 3' },
          { option: 'Option 4' }
        ]
      },
      {
        organization: '123412341234123412341234',
        title: 'FAKE poll',
        description: 'FAKE poll description',
        options: [
          { option: 'Option 5' },
          { option: 'Option 6' },
          { option: 'Option 7' },
          { option: 'Option 8' }
        ]
      }])
      .then(() => agent
        .get(`/api/v1/polls?organization=${organization.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'This is a new poll'
        }]);
      });
  });

  // get details of a poll including organization details and votes aggregation
  it('can get details of a poll including organization details and votes aggregation', async() => {
    const poll = await Poll
      .create({
        organization: organization._id,
        title: 'This is a new poll',
        description: 'I am the description of this poll',
        options: [
          { option: 'Option 1' },
          { option: 'Option 2' },
          { option: 'Option 3' },
          { option: 'Option 4' }
        ]
      })
      .then(res => res);
      
    await Vote.create([{
      poll: poll._id,
      user: mongoose.Types.ObjectId(),
      option: mongoose.Types.ObjectId()
    },
    {
      poll: poll._id,
      user: mongoose.Types.ObjectId(),
      option: mongoose.Types.ObjectId()
    }]);

    return agent
      .get(`/api/v1/polls/${poll.id}`)
      .then((res) => {
        // console.log('res', res.body);
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: {
            _id: organization.id,
            title: 'A New Org',
            description: 'this is a very cool org',
            imageUrl: 'placekitten.com/400/400',
            __v: 0
          },
          title: 'This is a new poll',
          description: 'I am the description of this poll',
          options: [
            { _id: expect.anything(), option: 'Option 1' },
            { _id: expect.anything(), option: 'Option 2' },
            { _id: expect.anything(), option: 'Option 3' },
            { _id: expect.anything(), option: 'Option 4' }
          ],
          __v: 0,
          votes: 2
        });
      });
  });

  // update a poll's title and/or description, with updated version key
  it('can update a polls title and/or description, with updated version key', () => {
    return Poll
      .create({
        organization: organization._id,
        title: 'This is a new poll',
        description: 'I am the description of this poll',
        options: [
          { option: 'Option 1' },
          { option: 'Option 2' },
          { option: 'Option 3' },
          { option: 'Option 4' }
        ]
      })
      .then(poll => agent
        .patch(`/api/v1/polls/${poll.id}`)
        .send({
          title: 'This is an updated Poll',
          description: 'I am edited'
        }))
      .then(async(res) => {
        // console.log('res', res.body);
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'This is an updated Poll',
          description: 'I am edited',
          options: [
            { _id: expect.anything(), option: 'Option 1' },
            { _id: expect.anything(), option: 'Option 2' },
            { _id: expect.anything(), option: 'Option 3' },
            { _id: expect.anything(), option: 'Option 4' }
          ],
          __v: 1
        });
      });
  });

  // delete a poll
  it('can delete a poll', () => {
    return Poll
      .create({
        organization: organization._id,
        title: 'This is a new poll',
        description: 'I am the description of this poll',
        options: [
          { option: 'Option 1' },
          { option: 'Option 2' },
          { option: 'Option 3' },
          { option: 'Option 4' }
        ]
      })
      .then(poll => agent
        .delete(`/api/v1/polls/${poll.id}`))
      .then(async(res) => {
        // console.log('res', res.body);
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'This is a new poll',
          description: 'I am the description of this poll',
          options: [
            { _id: expect.anything(), option: 'Option 1' },
            { _id: expect.anything(), option: 'Option 2' },
            { _id: expect.anything(), option: 'Option 3' },
            { _id: expect.anything(), option: 'Option 4' }
          ],
          __v: 0
        });
      });
  });
});
