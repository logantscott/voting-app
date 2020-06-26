require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');
const seed = require('./seed');

const User = require('../lib/models/User');
const request = require('supertest');
const app = require('../lib/app');

beforeAll(async() => {
  const uri = await mongod.getUri();
  return connect(uri);
});

beforeEach(() => {
  return mongoose.connection.dropDatabase();
});

beforeEach(() => {
  return seed({ users: 50, organizations: 5, memberships: 100, polls: 100, votes: 500 });
});

let agent = request.agent(app);
beforeEach(async() => {

  await User.create({
    name: 'Logan Scott',
    phone: '123 456 7890',
    email: 'email@email.com',
    password: '1234',
    communicationMedium: 'email',
    imageUrl: 'placekitten.com/400/400'
  });

  return agent
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

const prepareOne = model => JSON.parse(JSON.stringify(model));
const prepareMany = models => models.map(prepareOne);

const prepare = model => {
  if(Array.isArray(model)) return prepareMany(model);
  return prepareOne(model);
};

module.exports = {
  agent,
  prepare
};
