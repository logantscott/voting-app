require('../data-helpers/data-helpers');
const { agent, prepare } = require('../data-helpers/data-helpers');

const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');

describe('poll routes', () => {
  // create a poll
  it('can create a poll', async() => {
    const organization = prepare(await Organization.findOne());

    return agent
      .post('/api/v1/polls')
      .send({
        organization: organization._id,
        title: 'This is a new poll',
        description: 'I am the description of this poll',
        options: [
          { option: 'Option 1' },
          { option: 'Option 2' },
          { option: 'Option 3' },
          { option: 'Option 4' }
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization._id,
          title: 'This is a new poll',
          description: 'I am the description of this poll',
          options: [
            { _id: expect.anything(), option: 'Option 1' },
            { _id: expect.anything(), option: 'Option 2' },
            { _id: expect.anything(), option: 'Option 3' },
            { _id: expect.anything(), option: 'Option 4' }
          ],
          __v: 0
        });
      });
  });

  // get polls by organization
  it('can get polls by organization', async() => {
    const organization = prepare(await Organization.findOne());
    const polls = prepare(await Poll.find({ organization: organization._id }).select({ title: true }));

    return agent
      .get(`/api/v1/polls?organization=${organization._id}`)
      .then(res => {
        expect(res.body).toEqual(polls);
      });
  });

  // get details of a poll including organization details and votes aggregation
  it('can get details of a poll including organization details and votes aggregation', async() => {
    const organization = prepare(await Organization.findOne());
    const poll = prepare(await Poll.findOne({ organization: organization._id })
      .populate('organization')
      .populate('votes'));

    return agent
      .get(`/api/v1/polls/${poll._id}`)
      .then((res) => {
        // console.log('res', res.body);
        expect(res.body).toEqual(poll);
      });
  });

  // update a poll's title and/or description, with updated version key
  it('can update a polls title and/or description, with updated version key', async() => {
    const organization = prepare(await Organization.findOne());
    const poll = prepare(await Poll.findOne({ organization: organization._id }));

    return agent
      .patch(`/api/v1/polls/${poll._id}`)
      .send({
        title: 'This is an updated Poll',
        description: 'I am edited'
      })
      .then(async(res) => {
        // console.log('res', res.body);
        expect(res.body).toEqual({
          ...poll,
          title: 'This is an updated Poll',
          description: 'I am edited',
          __v: 1
        });
      });
  });

  // delete a poll
  it('can delete a poll', async() => {
    const organization = prepare(await Organization.findOne());
    const poll = prepare(await Poll.findOne({ organization: organization._id }));

    return agent
      .delete(`/api/v1/polls/${poll._id}`)
      .then(async(res) => {
        // console.log('res', res.body);
        expect(res.body).toEqual(poll);
      });
  });
});
