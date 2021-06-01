/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */
import BaseController from './base.controller';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import Constants from '../config/constants';
import axios from 'axios';
import qs from 'qs';
import { sendInquiryEmail } from '../lib/util';
import { generateSixDigitCode } from '../helpers';

class UsersController extends BaseController {
	whitelist = [
	  'phoneNumber',
	  'fullName',
	  'email',
	  'userId',
	  'verificationCode',
	];

	isUserExist = async (req, res, next) => {
	  try {
	    const params = this.filterParams(req.body, this.whitelist);
	    const user = await User.findOne({ phoneNumber: params['phoneNumber'] });
	    if (user) {
	      await this.sendMessage(params, res);
	      return res.status(200).json({ message: `OTP has been sent to ${params.phoneNumber}`, success: 1, type: 'success', redirect: false });
	    }
	    return res.status(200).json({ message: `User dese not exist with the provided phone number, please register first`, success: 0, type: 'info', redirect: false });
	  } catch (err) {
	    console.log('err', err.message);
	    next(err);
	  }
	}
	register = async (req, res, next) => {
	  const params = this.filterParams(req.body, this.whitelist);
	  try {
	    // Encrypt password
	    const newUser = new User(
	        {
	          ...params,
	        },
	    );
	    const updatedUser = await newUser.save();

	    jwt.sign({ updatedUser }, Constants.security.sessionSecret, { expiresIn: Constants.security.sessionExpiration },
	        (err, token) => {
			  if (err) throw err;
	          return res.status(200).json({
	        token,
	        newUser,
			success: 1,
			message: 'Registered Sucessfully!, please login to continue',
			type: 'success',
			redirect: true,
			phoneNumber: params['phoneNumber']
			  });
	        });
	  } catch (err) {
	    err.status = 200;
	    next(err);
	  }
	};

	verifyCode = async (req, res, next) => {
	  try {
	    const params = this.filterParams(req.body, this.whitelist);
	    console.log(params['verificationCode']);
	    const user = await User.findOne({
		  verificationCode: params['verificationCode'],
	    });
	    if (!user) {
	      return res.status(200).json({
	        success: 0,
			message: 'You entered an invalid code',
			type: 'fail',
			redirect: 2

	      });
	    }
	    const updatedUser = await User.findByIdAndUpdate(
	        user._id,
	        {
			  $set: {
	            verificationCode: null,
			  },
	        },
	        { new: true },
	    );
	    return res.status(200).json({
	      success: 1,
		  message: 'Code is verified!, You are loggedIn successfully!',
		  user: updatedUser,
		  type: 'success',
		  redirect: false
	    });
	  } catch (error) {
	    next(error);
	  }
	}

	sendMessage = async (data, res) => {
	  const verificationCode = generateSixDigitCode();
	  const mappedData = qs.stringify({
		  'apikey': 'VD9N2NVxAlU-BoXb36V0bAxrJq3v4grCmGcMh7RHcD',
		  'numbers': `${data.phoneNumber}`,
		  'sender': 'TigonF',
		  'message': `${verificationCode} . is your OTP to sign in with Trilok Secure. For security reasons please do not share this OTP with anyone.`,
	  });
	  const config = {
		  method: 'post',
		  url: 'https://api.textlocal.in/send/?',
		  headers: {
	      'Content-Type': 'application/x-www-form-urlencoded',
	      'Cookie': 'PHPSESSID=tu3npvnu9ptdatbqa9m5sgvba7',
		  },
		  data: mappedData,
	  };

	  axios(config)
	      .then(async function(response) {
			  const user = await User.findOne({ phoneNumber: data.phoneNumber }).exec();
	          const updated = await User.findByIdAndUpdate(
	            user._id,
	            {
	              $set: {
	                verificationCode,
	              },
	            },
	            { new: true },
	        ).select('-password');
	        if (updated) {
	          return res.status(200).json({
	            success: 1,
				message: `Your verification message has been sent to ${user.phoneNumber}`,
				type: 'success',
				redirect: false
	          });
	        }
		  console.log(JSON.stringify(response.data));
	      })
	      .catch(function(error) {
		  console.log(error);
	      });
	   }


	sendMail = async (req, res, next) => {
	  try {
	    const user ={
	      name: req.body.name,
	      phoneNumber: req.body.phoneNumber,
		  email: req.body.email,
		  message: req.body.message,
	    };
	    sendInquiryEmail(user);
	    res.status(200).json({
	      message: 'message has been sent',
		  success: 1,
		  email: req.body.email,
	    });
	  } catch (err) {
	    next(err);
	  }
	}
}

export default new UsersController();
