const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  // ref to poll (something something types object id),
  // ref to user,
  // ref to option selected
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // how do you do this
  // relevant? https://stackoverflow.com/questions/37283471/how-to-get-enum-values-from-mongoose-schema-using-virtual-method
  // order matters in arrays, so maybe just set the index?
  option: {
    type: String,
    enum: '?'
  }
});

// voteSchema.virtual('pollOptions').get(() => {

// });

module.exports = mongoose.model('Vote', voteSchema);
