const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  naam: String,
  email: { type: String, required: true, unique: true },
  wachtwoord: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'instructeur'], default: 'instructeur' },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('wachtwoord')) {
    this.wachtwoord = await bcrypt.hash(this.wachtwoord, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.wachtwoord);
};

module.exports = mongoose.model('User', userSchema);