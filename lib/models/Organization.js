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

orgSchema.statics.deleteWithPollsAndVotes = function(id) {
  return Promise.resolve(this.findByIdAndDelete(id))
    .then(res => res);
};

module.exports = mongoose.model('Organization', orgSchema);
