require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');
const Vote = require('../lib/models/Vote');
const User = require('../lib/models/User');
const Membership = require('../lib/models/Membership');

describe('organization routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let user, agent;
  beforeEach(async() => {
    agent = request.agent(app);

    user = await User.create({
      name: 'Logan Scott',
      phone: '123 456 7890',
      email: 'email@email.com',
      password: '1234',
      communicationMedium: 'email',
      imageUrl: 'placekitten.com/400/400'
    });

    await agent
      .post('/api/v1/users/login')
      .send({
        email: 'email@email.com',
        password: '1234'
      });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  // create an organization
  it('can create an organization', () => {
    return agent
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
      .then(() => agent.get('/api/v1/organizations'))
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
      .then(organization => agent.get(`/api/v1/organizations/${organization._id}`))
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
      .then(organization => agent.patch(`/api/v1/organizations/${organization._id}`)
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
      .then(async(organization) => agent.delete(`/api/v1/organizations/${organization._id}`))
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

    const polls = await Poll.create([
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

    await Vote.create([
      {
        poll: polls[0]._id,
        user: mongoose.Types.ObjectId(),
        option: mongoose.Types.ObjectId()
      },
      {
        poll: polls[1]._id,
        user: mongoose.Types.ObjectId(),
        option: mongoose.Types.ObjectId()
      },
      { // should not delete
        poll: polls[2]._id,
        user: mongoose.Types.ObjectId(),
        option: mongoose.Types.ObjectId()
      },
      {
        poll: polls[3]._id,
        user: mongoose.Types.ObjectId(),
        option: mongoose.Types.ObjectId()
      }
    ]);

    return agent
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

        return Vote.find().where('poll').in([polls[0]._id, polls[1]._id, polls[3]._id]);
      })
      .then(res => {
        expect(res).toEqual([]);
      });
  });

  it('can get an organization and all members of', async() => {
    const organization = await Organization.create({
      title: 'A New Org',
      description: 'this is a very cool org',
      imageUrl: 'placekitten.com/400/400',
    });

    // eslint-disable-next-line no-unused-vars
    const membership = await Membership.create({
      organization: organization._id,
      user: user._id
    });

    return agent
      .get(`/api/v1/organizations/${organization.id}?members=true`)
      .then(res => expect(res.body).toEqual({
        _id: expect.anything(),
        title: 'A New Org',
        description: 'this is a very cool org',
        imageUrl: 'placekitten.com/400/400',
        __v: 0,
        members: [
          { // select name, imageUrl
            _id: expect.anything(),
            name: 'Logan Scott',
            imageUrl: 'placekitten.com/400/400'
          }
        ]
      }));
  });
});
