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

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  // create a poll
  it('can create a poll', () => {
    return Organization.create({
      title: 'A New Org',
      description: 'this is a very cool org',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(organization => request(app)
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
        }))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: expect.any(mongoose.Schema.Types.ObjectId),
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
});
