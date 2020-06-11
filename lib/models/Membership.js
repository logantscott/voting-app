const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  // ref to org (something something types object id),
  // ref to user
});

module.exports = mongoose.model('Membership', membershipSchema);
