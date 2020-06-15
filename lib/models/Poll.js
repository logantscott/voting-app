const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  option: String
});

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
    type: [optionSchema],
    required: true,
    immutable: true
  }
}, { 
  toJSON: { virtuals: true,
    transform: (doc, ret) => {
      delete ret.id;
    } 
  }
});

pollSchema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'poll',
  count: true
});

// https://mongoosejs.com/docs/guide.html - update version key on update(), etc
pollSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  if(update.__v != null) {
    delete update.__v;
  }
  const keys = ['$set', '$setOnInsert'];
  for(const key of keys) {
    if(update[key] != null && update[key].__v != null) {
      delete update[key].__v;
      if(Object.keys(update[key]).length === 0) {
        delete update[key];
      }
    }
  }
  update.$inc = update.$inc || {};
  update.$inc.__v = 1;
});

module.exports = mongoose.model('Poll', pollSchema);
