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

describe('voting-app routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let organization;
  let user;
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
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  // create a poll
  it('can create a poll', () => {
    return request(app)
      .post('/api/v1/polls')
      .send({
        organization: organization._id,
        title: 'This is a new poll',
        description: 'I am the description of this poll',
        options: [
          'Option 1',
          'Option 2',
          'Option 3',
          'Option 4'
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'This is a new poll',
          description: 'I am the description of this poll',
          options: [
            'Option 1',
            'Option 2',
            'Option 3',
            'Option 4'
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
          'Option 1',
          'Option 2',
          'Option 3',
          'Option 4'
        ]
      },
      {
        organization: '123412341234123412341234',
        title: 'FAKE poll',
        description: 'FAKE poll description',
        options: [
          'Option 1',
          'Option 2',
          'Option 3',
          'Option 4'
        ]
      }])
      .then(() => request(app)
        .get(`/api/v1/polls?organization=${organization.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'This is a new poll'
        }]);
      });
  });

  // get details of a poll including organization details and votes aggregation
  it('can get details of a poll including organization details and votes aggregation', () => {
    return Poll
      .create({
        organization: organization._id,
        title: 'This is a new poll',
        description: 'I am the description of this poll',
        options: [
          'Option 1',
          'Option 2',
          'Option 3',
          'Option 4'
        ]
      })
      .then(poll => request(app)
        .get(`/api/v1/polls/${poll.id}`))
      .then(async(res) => {
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
            'Option 1',
            'Option 2',
            'Option 3',
            'Option 4'
          ],
          __v: 0,
          votes: 1
        });
      });
  });

  // update a poll's title and/or description
  it('can update a polls title and/or description', () => {
    return Poll
      .create({
        organization: organization._id,
        title: 'This is a new poll',
        description: 'I am the description of this poll',
        options: [
          'Option 1',
          'Option 2',
          'Option 3',
          'Option 4'
        ]
      })
      .then(poll => request(app)
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
            'Option 1',
            'Option 2',
            'Option 3',
            'Option 4'
          ],
          __v: 0
        });
      });
  });
});
