const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt') 

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'Please tell your name']
    },
    email: {
      type: String,
      require: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      require: true,
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      require: [true, 'Please confirm your password'],
      validate:{
        // this only works for SAVE!!!
        validator: function(el) {
          return el === this.password; 
        },
        message: "Passwords are not the same"
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
});

// encryption middlewere
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if(!this.isModified('password')) return next();

  // Hash password will cost 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next){
  if(!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({active: { $ne: false } });
  next();
})

// instance method
userSchema.methods.correctPassword = async function(
  candidatePassword, 
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function
(JWTTimestamp) {
  // if passwordChangedAt does not exist => the user didn't change the password
  if(this.passwordChangedAt) {
    const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    console.log(changeTimestamp, JWTTimestamp);
    return JWTTimestamp < changeTimestamp;
  }

  // False means NOT changes
  return false;
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now()+ 10 * 60 * 1000;

  // send with email the decrypted version and add the increpted one into the DB
  return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;