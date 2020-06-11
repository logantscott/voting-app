const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  // ref to org (something something types object id)
});

module.exports = mongoose.model('Poll', pollSchema);
