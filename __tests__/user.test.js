require('../data-helpers/data-helpers');
const { agent, prepare } = require('../data-helpers/data-helpers');

const request = require('supertest');
const app = require('../lib/app');

const User = require('../lib/models/User');
const Membership = require('../lib/models/Membership');

describe('user routes', () => {
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
    return agent
      .get('/api/v1/users')
      .then((res) => {
        expect(res.body).toEqual(
          [...Array(51)].map(() => ({
            _id: expect.anything(), 
            name: expect.any(String)
          }))
        );
      });
  });

  // get a single user by id
  it('can get a single user by id', async() => {
    const user = await User.findOne();

    return agent
      .get(`/api/v1/users/${user._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          communicationMedium: user.communicationMedium,
          imageUrl: user.imageUrl,
          __v: 0
        });
      });
  });

  // get all users by communicationMedium
  // route not set up for proper test with no select for communicationMedium

  // it('can get all users by communicationMedium', () => {
  //   return agent
  //     .get('/api/v1/users?communicationMedium=email')
  //     .then(res => {
  //       expect(res.body).toEqual([
  //         res.body.map(() => ({
  //           _id: expect.anything(),
  //           name: expect.any(String)
  //         }))
  //       ]);
  //     });
  // });

  // update a single user by id
  it('can update a single user by id', async() => {
    const user = await User.findOne();

    return agent
      .patch(`/api/v1/users/${user._id}`)
      .send({ phone: '999 999 9999' })
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          name: user.name,
          phone: '999 999 9999',
          email: user.email,
          communicationMedium: user.communicationMedium,
          imageUrl: user.imageUrl,
          __v: 0
        });
      });
  });

  // delete a single user by id
  it('can delete a single user by id', async() => {
    const user = await User.findOne();

    return agent
      .delete(`/api/v1/users/${user._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          communicationMedium: user.communicationMedium,
          imageUrl: user.imageUrl,
          __v: 0
        });
      });
  });

  it('can get an organization and all members of', async() => {
    // eslint-disable-next-line no-unused-vars
    const membership = await Membership.findOne();

    return agent
      .get(`/api/v1/users/${membership.user}?organizations=true`)
      .then(res => expect(res.body).toEqual({
        _id: membership.user.toString(),
        name: expect.any(String),
        phone: expect.any(String),
        email: expect.any(String),
        communicationMedium: expect.any(String),
        imageUrl: expect.any(String),
        __v: 0,
        organizations: 
          res.body.organizations.map(() => ({ 
            _id: expect.anything(),
            title: expect.any(String),
            imageUrl: expect.any(String)
          }))
      }));
  });

  
  it('sets a password hash', () => {
    const user = new User({
      email: 'logan@test.com',
      password: '1234',
      profileImage: 'placekitten.com/400/400'
    });

    expect(user.passwordHash).toEqual(expect.any(String));
  });

  it('has an authToken method', () => {
    const user = new User({
      email: 'logan@test.com',
      password: '1234',
      profileImage: 'placekitten.com/400/400'
    });

    expect(user.authToken()).toEqual(expect.any(String));
  });

  it('can verify a token and return a user', () => {
    const user = new User({
      email: 'logan@test.com',
      password: '1234',
      profileImage: 'placekitten.com/400/400'
    });

    const token = user.authToken();
    const verifiedUser = User.verifyToken(token);

    expect(verifiedUser.toJSON()).toEqual(user.toJSON());
  });
});
