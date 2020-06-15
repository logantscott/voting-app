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

  const polls = await this.model('Poll').find({ organization: id })
    .then(polls => polls.map(poll => poll._id));

  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('Vote').deleteMany().where('poll').in(polls),
    this.model('Poll').deleteMany({ organization: id })
  ])
    .then(([res]) => res);
};

module.exports = mongoose.model('Organization', orgSchema);
