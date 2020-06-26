const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
});

orgSchema.statics.deleteWithPollsAndVotes = async function(id) {
  // is there a better way to do this?
  const polls = await this.model('Poll').find({ organization: id })
    .then(polls => polls.map(poll => poll._id));

  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('Vote').deleteMany().where('poll').in(polls),
    this.model('Poll').deleteMany({ organization: id })
  ])
    .then(([res]) => res);
};

orgSchema.statics.findOrganizationWithMembers = async function(id) {
  const userIds = await this.model('Membership').find({ organization: id })
    .then(memberships => memberships.map(membership => membership.user));
  const users = await this.model('User').find({ _id: { $in: userIds } })
    .select({ name: true, imageUrl: true });

  let organization = await this.findById(id)
    .then(res => res.toJSON());

  organization['members'] = users;

  return organization;
};

module.exports = mongoose.model('Organization', orgSchema);
