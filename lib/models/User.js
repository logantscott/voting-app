const mongoose = require('mongoose');

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
  }
});

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
