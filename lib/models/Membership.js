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

membershipSchema.statics.deleteWithPollsAndVotes = async function(id) {

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

module.exports = mongoose.model('Membership', membershipSchema);
