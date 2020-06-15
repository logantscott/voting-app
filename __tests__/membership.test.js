const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Membership = require('../lib/models/Membership');
const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');
const Vote = require('../lib/models/Vote');
const Poll = require('../lib/models/Poll');

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

  // delete a membership and all votes by user
  // it('can delete a membership and all votes by user', async() => {

  //   const membership = await Membership
  //     .create({
  //       organization: organization._id,
  //       user: user._id
  //     });

  //   const polls = await Poll
  //     .create([
  //       {
  //         organization: organization._id,
  //         title: 'Poll 1',
  //         description: 'I am the description of this poll',
  //         options: [{ option: 'Option 1' }, { option: 'Option 2' }, { option: 'Option 3' }, { option: 'Option 4' }]
  //       },
  //       { // votes on this poll should not get deleted
  //         organization: mongoose.Types.ObjectId(),
  //         title: 'Poll 2',
  //         description: 'I am the description of this poll',
  //         options: [{ option: 'Option 1' }, { option: 'Option 2' }, { option: 'Option 3' }, { option: 'Option 4' }]
  //       },
  //       {
  //         organization: organization._id,
  //         title: 'Poll 3',
  //         description: 'I am the description of this poll',
  //         options: [{ option: 'Option 1' }, { option: 'Option 2' }, { option: 'Option 3' }, { option: 'Option 4' }]
  //       }
  //     ]);

  //   await Vote
  //     .create([
  //       {
  //         poll: polls[0]._id,
  //         user: user._id,
  //         option: mongoose.Types.ObjectId()
  //       },
  //       {
  //         poll: polls[1]._id,
  //         user: user._id,
  //         option: mongoose.Types.ObjectId()
  //       },
  //       {
  //         poll: polls[2]._id,
  //         user: user._id,
  //         option: mongoose.Types.ObjectId()
  //       }
  //     ]);
    
  //   return request(app)
  //     .delete(`/api/v1/memberships/${membership.id}`)
  //     .then(res => {
  //       expect(res.body).toEqual({
  //         _id: expect.anything(),
  //         organization: organization.id,
  //         user: user.id,
  //         __v: 0
  //       });

  //       return Vote.find({ user: user.id, poll: { $in: [polls[0]._id, polls[2]._id] } })
  //         .then(res => expect(res).toEqual([]));
  //     });
  // });
});
