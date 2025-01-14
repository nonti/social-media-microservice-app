import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import logger from "../utils/logger.js";
import { validateRegistration } from "../utils/validation.js";


//user registration
export const registerUser = async (req, res) => {
  logger.info('Registration endpoint hit');
  try {
    //validate the schema
    const {error} = validateRegistration(req.body);
     if(error){
      logger.warn('Validation error', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,

      });
     }
     const {username, email, password} = req.body;
     let user = await User.findOne({$or: [{email},{username}]});
     if(user){
      logger.warn('User already exists');
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
     }

     user = new User({username, email, password, bio});
      await user.save();
      logger.warn('User registered successfully', user._id);

      const { accessToken, refreshToken } = await generateToken(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        accessToken,
        refreshToken,
      })
  } catch (err) {
    logger.error('Error registering user', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

//user login


//refresh token


//logout