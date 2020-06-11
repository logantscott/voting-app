const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    immutable: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    immutable: true
  }
});

module.exports = mongoose.model('Poll', pollSchema);
