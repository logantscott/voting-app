const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
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

  // create an organization
  it('can create an organization', () => {
    return request(app)
      .post('/api/v1/organization')
      .send({
        title: 'A New Org',
        description: 'this is a very cool org',
        imageUrl: 'placekitten.com/400/400'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'A New Org',
          description: 'this is a very cool org',
          imageUrl: 'placekitten.com/400/400',
          __v: 0
        });
      });
  });

  // get all organizations
  it('can get all organizations', () => {
    return Organization.create({
      title: 'A New Org',
      description: 'this is a very cool org',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(() => request(app).get('/api/v1/organization'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'A New Org',
          imageUrl: 'placekitten.com/400/400'
        }]);
      });
  });

  // get a single organization by id
  it('can get a single organization by id', () => {
    return Organization.create({
      title: 'A New Org',
      description: 'this is a very cool org',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(organization => request(app).get(`/api/v1/organization/${organization._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'A New Org',
          description: 'this is a very cool org',
          imageUrl: 'placekitten.com/400/400',
          __v: 0
        });
      });
  });

  // update a single organization by id
  it('can update a single organization by id', () => {
    return Organization.create({
      title: 'A New Org',
      description: 'this is a very cool org',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(organization => request(app).patch(`/api/v1/organization/${organization._id}`)
        .send({ description: 'this org kinda sucks' }))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'A New Org',
          description: 'this org kinda sucks',
          imageUrl: 'placekitten.com/400/400',
          __v: 0
        });
      });
  });

  // delete a single organization by id
  it('can delete a single organization by id', () => {
    return Organization.create({
      title: 'A New Org',
      description: 'this is a very cool org',
      imageUrl: 'placekitten.com/400/400'
    })
      .then(organization => request(app).delete(`/api/v1/organization/${organization._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'A New Org',
          description: 'this is a very cool org',
          imageUrl: 'placekitten.com/400/400',
          __v: 0
        });
      });
  });
});
