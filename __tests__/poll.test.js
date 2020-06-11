const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');

describe('voting-app routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let organization;
  beforeEach(async() => {
    organization = await Organization.create({
      title: 'A New Org',
      description: 'this is a very cool org',
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

  // gets polls by organization
  it('can create a poll', () => {
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
});
