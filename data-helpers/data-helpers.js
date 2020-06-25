require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');
const seed = require('./seed');

const request = require('supertest');
const app = require('../lib/app');
const chance = require('chance').Chance();

const Membership = require('../lib/models/Membership');
const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');
const User = require('../lib/models/User');
const Vote = require('../lib/models/Vote');

beforeAll(async() => {
  const uri = await mongod.getUri();
  return connect(uri);
});

beforeEach(() => {
  return mongoose.connection.dropDatabase();
});

beforeEach(() => {
  return seed;
});

beforeEach(async() => {
  const arr = (n, mixin) => {
    return [...Array(n)].map(() => mixin);
  };

  const users = await arr(500, chance.user());
  
  let agent = request.agent(app);
  let user = chance.pickone(users);
  await agent
    .post('/api/v1/users/login')
    .send({
      email: user.email,
      password: user.password
    });

  await User.create({ ...users });
});

afterAll(async() => {
  await mongoose.connection.close();
  return mongod.stop();
});
