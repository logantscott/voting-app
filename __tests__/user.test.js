const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

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

  // get all users
  it('can get all users', () => {
    return User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(() => request(app).get('/api/v1/user'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          name: 'Logan Scott'
        }]);
      });
  });

  // get a single user by id
  it('can get a single user by id', () => {
    return User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(user => request(app).get(`/api/v1/user/${user._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Logan Scott',
          phone: '123 456 7890',
          email: 'email@email.com',
          communicationMedium: 'email',
          imageUrl: 'placekitten.com/400/400',
          __v: 0
        });
      });
  });
});
