const chance = require('chance').Chance();

const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');
const Membership = require('../lib/models/Membership');
const Poll = require('../lib/models/Poll');
const Vote = require('../lib/models/Vote');

module.exports = async({ users = 50, organizations = 5, memberships = 100, polls = 200, votes = 500 } = {}) => {
  const communicationMedium = ['email', 'phone'];

  const createdUsers = await User.create([...Array(users)].map(() => ({
    name: chance.name(),
    phone: chance.phone({ country: 'us' }),
    email: chance.email({ domain: 'email.com' }),
    password: chance.string(),
    communicationMedium: chance.pickone(communicationMedium),
    imageUrl: chance.url({ extensions: ['jpg', 'png'] })
  })));

  const createdOrganizations = await Organization.create([...Array(organizations)].map(() => ({
    title: chance.company(),
    description: chance.paragraph(),
    imageUrl: chance.url({ extensions: ['jpg', 'png'] })
  })));
  
  await Membership.create([...Array(memberships)].map(() => ({
    organization: chance.pickone(createdOrganizations)._id,
    user: chance.pickone(createdUsers)._id
  })));

  const createdPolls = await Poll.create([...Array(polls)].map(() => ({
    organization: chance.pickone(createdOrganizations)._id,
    title: chance.sentence() + '?',
    description: chance.sentence(),
    options: [
      { option: chance.animal() },
      { option: chance.animal() },
      { option: chance.animal() },
      { option: chance.animal() }
    ]
  })));

  Vote.ensureIndexes();
  await Vote.create([...Array(votes)].map(() => {
    const poll = chance.pickone(createdPolls);
    return {
      poll: poll._id,
      user: chance.pickone(createdUsers)._id,
      option: poll.options[chance.natural({ min: 0, max: 3 })]._id
    };
  }
  ))
    .catch(err => {
      if(err.code === 11000){
        // console.log('duplicate key error - user can\'t vote twice');
      } else {
        throw err;
      }
    });

};
