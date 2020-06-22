const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  communicationMedium: {
    type: String,
    required: true,
    enum: ['phone', 'email'],
    default: 'email'
  },
  imageUrl: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id;
      delete ret.passwordHash;
    }
  }
});


userSchema.virtual('password').set(function(password) {
  this.passwordHash = bcrypt.hashSync(password, +process.env.SALT_ROUNDS || 8);
});


userSchema.methods.compare = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

userSchema.statics.findUserWithOrganizations = async function(id) {

  const orgIds = await this.model('Membership').find({ user: id })
    .then(memberships => memberships.map(membership => membership.organization));

  const organizations = await this.model('Organization').find({ _id: { $in: orgIds } })
    .select({ title: true, imageUrl: true });

  let user = await this.findById(id)
    .then(res => res.toJSON());
  user['organizations'] = organizations;
  return user;
};

module.exports = mongoose.model('User', userSchema);
