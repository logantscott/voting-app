const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  // ref to poll (something something types object id),
  // ref to user,
  // ref to option selected
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
    immutable: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true
  },
  // how do you do this
  // maybe set enum to actual options, relevant? https://stackoverflow.com/questions/37283471/how-to-get-enum-values-from-mongoose-schema-using-virtual-method
  // maybe make options a subdocument for ids?
  // order matters in arrays, so maybe just set the index?
  option: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// save this for later to see if it is helpful:
// https://stackoverflow.com/questions/43388025/how-to-get-aggregated-sum-of-values-in-an-array-of-mongoose-subdocuments-when-qu

// voteSchema.virtual('pollOptions').get(() => {

// });

voteSchema.index({ user: 1, poll: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
