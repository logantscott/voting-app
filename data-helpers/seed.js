

const chance = require('chance').Chance();

const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');
const Membership = require('../lib/models/Membership');
const Poll = require('../lib/models/Poll');
const Vote = require('../lib/models/Vote');


module.exports = async({ users = 50, organizations = 5, memberships = 100 } = {}) => {
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
    description: chance.sentence(),
    imageUrl: chance.url({ extensions: ['jpg', 'png'] })
  })));
  
  await Membership.create([...Array(memberships)].map(() => ({
    organization: chance.pickone(createdOrganizations)._id,
    user: chance.pickone(createdUsers)._id
  })));

  // 'membership': function() {
  //   return {
  //     //organization: chance.pickone(organizations)._id,
  //     //user: chance.pickone(users)._id
  //   };
  // },

  // 'poll': function() {
  //   return {
  //     //organization: chance.pickone(organizations)._id,
  //     title: 'This is a new poll',
  //     description: chance.sentence(),
  //     options: [
  //       { option: 'Option 1' },
  //       { option: 'Option 2' },
  //       { option: 'Option 3' },
  //       { option: 'Option 4' }
  //     ]
  //   };
  // },

  // 'vote': function() {
  //   return {
  //     //poll: chance.pickone(polls)._id,
  //     //user: chance.pickone(users)._id,
  //     option: ''
  //   };
  // }




  // await Organization.create({[
    
  // ]});

  // await Membership.create({[
    
  // ]});

  // await Poll.create({[
    
  // ]});

  // await Vote.create({[
    
  // ]});

};
