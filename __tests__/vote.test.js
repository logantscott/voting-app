const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Vote = require('../lib/models/Vote');

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

  // create a new vote
  it('can create a vote', () => {
    return request(app)
      .post('/api/v1/votes')
      .send({

      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),

          __v: 0
        });
      });
  });
});
