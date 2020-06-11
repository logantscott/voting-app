const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Membership = require('../lib/models/Membership');

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

  // create a new membership
  it('can create a membership', () => {
    return request(app)
      .post('/api/v1/memberships')
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
