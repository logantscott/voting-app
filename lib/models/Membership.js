const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  // ref to org (something something types object id),
  // ref to user
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

membershipSchema.statics.deleteWithVotesByUser = async function(id) {

  const organizationId = await this.findById(id)
    .then(res => res.organization);

  const userId = await this.findById(id)
    .then(res => res.user);

  const pollIds = await this.model('Poll').find({ organization: organizationId })
    .then(polls => polls.map(poll => poll._id));

  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('Vote').deleteMany({ user: userId, poll: { $in: pollIds } })
  ])
    .then(([res]) => res);
};

module.exports = mongoose.model('Membership', membershipSchema);
