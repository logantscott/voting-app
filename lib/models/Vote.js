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
  // maybe set enum to actual options, relevant? https://stackoverflow.com/questions/37283471/how-to-get-enum-values-from-mongoose-schema-using-virtual-method
  // maybe make options a subdocument for ids?
  // order matters in arrays, so maybe just set the index?
  option: {
    type: Number,
    required: true
  }
});

// voteSchema.virtual('pollOptions').get(() => {

// });

module.exports = mongoose.model('Vote', voteSchema);
