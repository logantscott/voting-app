const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  // ref to poll (something something types object id),
  // ref to user,
  // ref to option selected
});

module.exports = mongoose.model('Vote', voteSchema);
