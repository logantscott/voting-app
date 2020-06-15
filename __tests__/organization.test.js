const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');
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

  // create an organization
  it('can create an organization', () => {
    return request(app)
      .post('/api/v1/organizations')
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
      .then(() => request(app).get('/api/v1/organizations'))
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
      .then(organization => request(app).get(`/api/v1/organizations/${organization._id}`))
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
      .then(organization => request(app).patch(`/api/v1/organizations/${organization._id}`)
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
      .then(async(organization) => request(app).delete(`/api/v1/organizations/${organization._id}`))
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

describe('can delete all associated polls and votes of deleted organization', () => {
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

  it('can delete all associated polls of deleted organization', async() => {

    const organization = await Organization.create([
      {
        title: 'A New Org',
        description: 'this is a very cool org',
        imageUrl: 'placekitten.com/400/400'
      },      {
        title: 'A Second Org',
        description: 'this is another very cool org',
        imageUrl: 'placekitten.com/400/400'
      }
    ]);

    await Poll.create([
      {
        organization: organization[0]._id,
        title: 'Poll 1',
        description: 'I am the description of this poll',
        options: [{ option: 'Option 1' }, { option: 'Option 2' }, { option: 'Option 3' }, { option: 'Option 4' }]
      },
      {
        organization: organization[0]._id,
        title: 'Poll 2',
        description: 'I am the description of this poll',
        options: [{ option: 'Option 1' }, { option: 'Option 2' }, { option: 'Option 3' }, { option: 'Option 4' }]
      },
      { // should not delete
        organization: organization[1]._id,
        title: 'Poll 3',
        description: 'I am the description of this poll',
        options: [{ option: 'Option 1' }, { option: 'Option 2' }, { option: 'Option 3' }, { option: 'Option 4' }]
      },
      {
        organization: organization[0]._id,
        title: 'Poll 4',
        description: 'I am the description of this poll',
        options: [{ option: 'Option 1' }, { option: 'Option 2' }, { option: 'Option 3' }, { option: 'Option 4' }]
      }
    ]);

    // const polls = await Poll.find({
    //   organization: organization[0]._id
    // });

    // console.log(polls);

    request(app).delete(`/api/v1/organizations/${organization[0]._id}`);

    return request(app)
      .delete(`/api/v1/organizations/${organization[0].id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'A New Org',
          description: 'this is a very cool org',
          imageUrl: 'placekitten.com/400/400',
          __v: 0
        });

        return Poll.find({ organization: organization[0].id });
      })
      .then(res => {
        expect(res).toEqual([]);
      });
  });
});
