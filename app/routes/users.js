/* eslint-disable max-len */
import { Router } from 'express';
import UsersController from '../controllers/user.controller';
import authenticate from '../middleware/authenticate';
import profile from '../middleware/profile-media';
import errorHandler from '../middleware/error-handler';


const users = new Router();

// Users Routes
users.get('/test', (req, res) => {
  res.json({
    message: 'welcome in govver way',
  });
});
users.post('/register', UsersController.register);
users.post('/verify-user', UsersController.isUserExist);

users.post('/verify-code', UsersController.verifyCode);

users.use(errorHandler);

export default users;
