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

module.exports = mongoose.model('Membership', membershipSchema);
