const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Membership = require('../lib/models/Membership');
const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');

describe('voting-app routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let organization, user;
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

  // create a new membership
  it('can create a membership', () => {
    return request(app)
      .post('/api/v1/memberships')
      .send({
        organization: organization._id,
        user: user._id
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
          __v: 0
        });
      });
  });

  // get all users in an organization
  it('can get all users in an organization', () => {
    return Membership
      .create({
        organization: organization._id,
        user: user._id
      })
      .then(() => request(app)
        .get(`/api/v1/memberships?organization=${organization.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          organization: {
            _id: organization.id,
            title: organization.title,
            imageUrl: organization.imageUrl
          },
          user: {
            _id: user.id,
            name: user.name,
            imageUrl: user.imageUrl
          },
          __v: 0
        }]);
      });
  });

  // get all organizations a user is part of
  it('can get all organizations a user is part of', () => {
    return Membership
      .create({
        organization: organization._id,
        user: user._id
      })
      .then(() => request(app)
        .get(`/api/v1/memberships?user=${user.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          organization: {
            _id: organization.id,
            title: organization.title,
            imageUrl: organization.imageUrl
          },
          user: {
            _id: user.id,
            name: user.name,
            imageUrl: user.imageUrl
          },
          __v: 0
        }]);
      });
  });

  // delete a membership
  it('can delete a membership', () => {
    return Membership
      .create({
        organization: organization._id,
        user: user._id
      })
      .then(membership => request(app)
        .delete(`/api/v1/memberships/${membership.id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
          __v: 0
        });
      });
  });
});
