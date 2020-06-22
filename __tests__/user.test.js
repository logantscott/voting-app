require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');
const Membership = require('../lib/models/Membership');

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

  // create a user
  it('can create a user', () => {
    return request(app)
      .post('/api/v1/users/signup')
      .send({
        name: 'Logan Scott',
        phone: '123 456 7890',
        email: 'email@email.com',
        password: '1234',
        communicationMedium: 'email',
        imageUrl: 'placekitten.com/400/400'
      })
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

  // get all users
  it('can get all users', () => {
    return User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      password: '1234',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(() => request(app).get('/api/v1/users'))
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
      password: '1234',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(user => request(app).get(`/api/v1/users/${user._id}`))
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

  // get all users by communicationMedium
  it('can get all users by communicationMedium', () => {
    return User.create([{
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      password: '1234',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    },
    {
      name: 'Phony',
      phone: '123 456 7890',
      email: 'email@email.com',
      password: '5678',
      communicationMedium: 'phone',
      imageUrl: 'placekitten.com/400/400'
    }])
      .then(() => request(app).get('/api/v1/users?communicationMedium=email'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          name: 'Logan Scott'
        }]);
      });
  });

  // update a single user by id
  it('can update a single user by id', () => {
    return User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      password: '1234',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(user => request(app).patch(`/api/v1/users/${user._id}`)
        .send({ phone: '999 999 9999' }))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Logan Scott',
          phone: '999 999 9999',
          email: 'email@email.com',
          communicationMedium: 'email',
          imageUrl: 'placekitten.com/400/400',
          __v: 0
        });
      });
  });

  // delete a single user by id
  it('can delete a single user by id', () => {
    return User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      password: '1234',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(user => request(app).delete(`/api/v1/users/${user._id}`))
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

  it('can get an organization and all members of', async() => {
    const organization = await Organization.create({
      title: 'A New Org',
      description: 'this is a very cool org',
      imageUrl: 'placekitten.com/400/400',
    });

    const user = await User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      password: '1234',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    });

    // eslint-disable-next-line no-unused-vars
    const membership = await Membership.create({
      organization: organization._id,
      user: user._id
    });

    return request(app)
      .get(`/api/v1/users/${user.id}?organizations=true`)
      .then(res => expect(res.body).toEqual({
        _id: expect.anything(),
        name: 'Logan Scott',
        phone: '123 456 7890',
        email: 'email@email.com',
        communicationMedium: 'email',
        imageUrl: 'placekitten.com/400/400',
        __v: 0,
        organizations: [
          { // select name, imageUrl
            _id: expect.anything(),
            title: 'A New Org',
            imageUrl: 'placekitten.com/400/400'
          }
        ]
      }));
  });

});
