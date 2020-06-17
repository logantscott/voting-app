const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

describe('user routes', () => {
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

  // signup a user
  it('can signup a user', () => {
    return request(app)
      .post('/api/v1/users')
      .send({
        name: 'Logan Scott',
        phone: '123 456 7890',
        email: 'email@email.com',
        communicationMedium: 'email',
        imageUrl: 'placekitten.com/400/400'
      })
      .then(res => {
        expect(res.body).toEqual({

        });
      });
  });

  // login a user
  it('can login a user', () => {
    return User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(() => request(app).get('/api/v1/users'))
      .then(res => {
        expect(res.body).toEqual([{

        }]);
      });
  });

  // authenticate a user
  it('can authenticate a user', () => {
    return User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(user => request(app).get(`/api/v1/users/${user._id}`))
      .then(res => {
        expect(res.body).toEqual({

        });
      });
  });
});
