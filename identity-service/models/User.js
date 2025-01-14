import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  bio:{
    type: String,
    default: 'No bio provided'
  }, 
  createdAt: {
    type: Date,
    default: Date.now,
  }
},
{
  timestamps: true,
});


userSchema.pre('save', async function(next){
  if(this.isModified('password')){
    try {
      const hashedPassword = await argon2.hash(this.password);
      this.password = hashedPassword;
    } catch (error) {
      return next(error);
    }
  }
})

userSchema.methods.comparePassword = async function(candidatePassword){
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    throw error;
  }
}

userSchema.index({username: 'text'});

export default mongoose.model('User', userSchema);