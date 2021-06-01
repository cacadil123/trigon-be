/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// user schema
const userSchema = new Schema(
    {
      fullName: {
        type: String,
      },

      email: {
        type: String,
      },

      phoneNumber: {
        type: String,
      },
      verificationCode: {
        type: String,
        default: null,
      },
      meta: {
        type: String,
        default: '',
      },
    },
    {
      timestamps: true,
    });

const User = mongoose.model('user', userSchema);

export default User;
