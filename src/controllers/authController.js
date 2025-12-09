const passport = require('passport');
const { COMMON, ERRORS } = require('../consts');
const {
  profileDal,
} = require('../dal');
const {
  Unauthorized,
  UnprocessableEntity,
  NotFound,
  BadRequest,
} = require('../helpers/errors');
const emailService = require('../helpers/email');
const smsService = require('../helpers/sms');
const { generateToken, verifyToken } = require('../helpers/token');
const { getHashPasswordAndSalt, validatePassword } = require('../helpers/auth/user');
const { profileService } = require('../services/profileService');

const authController = {};

// Email/Password Signup
authController.signup = async (req, res, next) => {
  try {
    // Set CORS headers explicitly
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    passport.authenticate('signup', async (error, user, info) => {
      try {
        if (error) {
          return res.status(error?.status || 500).json({ 
            success: false, 
            message: error.message 
          });
        }
        if (!user || !info) {
          return res.status(400).json({ 
            success: false, 
            message: 'Signup failed. Please check your information.' 
          });
        }
        return res.status(200).json({ 
          success: true, 
          user, 
          token: info.token,
          message: info.message 
        });
      } catch (error) {
        console.error('[Auth] Signup error:', error);
        return res.status(500).json({ 
          success: false, 
          message: ERRORS.SIGN_UP || 'Signup failed' 
        });
      }
    })(req, res, next);
  } catch (error) {
    console.error('[Auth] Signup controller error:', error);
    return res.status(500).json({ 
      success: false, 
      message: ERRORS.SIGN_UP || 'Signup failed' 
    });
  }
};

// Email/Password Signin
authController.signin = async (req, res, next) => {
  try {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    passport.authenticate('signin', async (error, user, info) => {
      try {
        if (error) {
          return res.status(error?.status || 500).json({ 
            success: false, 
            message: error.message 
          });
        }
        if (!user || !info) {
          return res.status(400).json({ 
            success: false, 
            message: 'Login failed. Please check your credentials.' 
          });
        }
        return res.status(200).json({ 
          success: true, 
          user, 
          token: info.token,
          message: info.message 
        });
      } catch (error) {
        console.error('[Auth] Signin error:', error);
        return res.status(500).json({ 
          success: false, 
          message: ERRORS.SIGN_IN || 'Signin failed' 
        });
      }
    })(req, res, next);
  } catch (err) {
    console.error('[Auth] Signin controller error:', err);
    return res.status(500).json({ 
      success: false, 
      message: ERRORS.SIGN_IN || 'Signin failed' 
    });
  }
};

// Send OTP to phone number
authController.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user by phone
    let user = await profileDal.Model.findOne({ phone });
    
    if (!user) {
      // Create new user with phone
      user = await profileDal.Model.create({
        phone,
        key: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        otp,
        otpExpires,
      });
    } else {
      // Update existing user's OTP
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    }

    // Send OTP via Twilio SMS service
    try {
      await smsService.sendOTP(phone, otp);
    } catch (smsError) {
      console.error('[Auth] SMS send error:', smsError);
      // In development, still return success and log OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Auth] OTP for ${phone}: ${otp}`);
      } else {
        // In production, return error if SMS fails
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to send OTP via SMS. Please try again later.' 
        });
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      // Only return OTP in development mode for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('[Auth] Send OTP error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP' 
    });
  }
};

// Verify OTP
authController.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, flow } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and OTP are required' 
      });
    }

    const user = await profileDal.Model.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(401).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    if (flow === 'login') {
      const token = generateToken(user.toJSON());
      return res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully',
        token,
        user: user.toJSON()
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });
  } catch (error) {
    console.error('[Auth] Verify OTP error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP' 
    });
  }
};

// Logout
authController.logout = async (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
};

// Forgot Password
authController.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    let profile = await profileDal.getOneByEmail(email);
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: ERRORS.USER_NOT_EXIST 
      });
    }
    
    const resetToken = generateToken(profile);
    
    // Build reset URL - prioritize SERVER_URL, then SERVER_IP, then HOST
    let resetPageUrl;
    if (process.env.SERVER_URL) {
      // Use SERVER_URL if explicitly set (best for production)
      resetPageUrl = `${process.env.SERVER_URL}/reset-password?${COMMON.RESET_TOKEN}=${resetToken}`;
    } else if (process.env.SERVER_IP) {
      // Use SERVER_IP if set (for development with network access)
      const port = process.env.PORT || 3000;
      resetPageUrl = `http://${process.env.SERVER_IP}:${port}/reset-password?${COMMON.RESET_TOKEN}=${resetToken}`;
    } else if (process.env.HOST && !process.env.HOST.includes('localhost')) {
      // Use HOST if it's not localhost
      resetPageUrl = `${process.env.HOST}/reset-password?${COMMON.RESET_TOKEN}=${resetToken}`;
    } else {
      // Default: use IP address (192.168.1.100) for network accessibility
      const port = process.env.PORT || 3000;
      const serverIP = '192.168.1.100'; // Your machine's IP address
      resetPageUrl = `http://${serverIP}:${port}/reset-password?${COMMON.RESET_TOKEN}=${resetToken}`;
    }
    
    try {
      await emailService.sendResetPasswordEmail({
        email: profile.email,
        recipientFirstName: profile.displayName || profile.firstName || profile.username || 'User',
        resetPageUrl
      });
    } catch (emailError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] Email send error:', emailError);
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      message: COMMON.RESET_PASSWORD_EMAIL_SENT || 'Reset password email sent' 
    });
  } catch (error) {
    console.error('[Auth] Forget password error:', error);
    return res.status(500).json({ 
      success: false, 
      message: ERRORS.UNEXPECTED_ERROR || 'An unexpected error occurred' 
    });
  }
};

// Reset Password
authController.resetPassword = async (req, res) => {
  try {
    const { newPassword, resetToken } = req.body;
    
    if (!newPassword || !resetToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password and reset token are required' 
      });
    }

    // Verify token and extract user email
    let decodedToken;
    try {
      decodedToken = verifyToken(resetToken);
    } catch (tokenError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    if (!decodedToken || !decodedToken.sub || !decodedToken.sub.email) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid reset token' 
      });
    }

    const email = decodedToken.sub.email;
    const profile = await profileDal.getOneByEmail(email);
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { password, salt } = await getHashPasswordAndSalt(newPassword);
    
    await profileDal.Model.updateOne(
      { email },
      { password, salt, resetToken: undefined }
    );

    return res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('[Auth] Reset password error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
    });
  }
};

// Register with OTP - Set password after OTP verification
authController.registerWithOTP = async (req, res) => {
  try {
    const { phone, password, firstName, lastName, email } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and password are required' 
      });
    }

    const user = await profileDal.Model.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please verify OTP first.' 
      });
    }

    const { password: hashedPassword, salt } = await getHashPasswordAndSalt(password);
    
    const updateData = {
      password: hashedPassword,
      salt,
      otp: undefined,
      otpExpires: undefined,
    };

    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    
    if (firstName && lastName) {
      updateData.displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
    } else if (firstName) {
      updateData.displayName = firstName.trim();
    } else if (lastName) {
      updateData.displayName = lastName.trim();
    }
    
    if (email) updateData.email = email.toLowerCase();

    await profileDal.Model.updateOne({ phone }, updateData);
    
    const updatedUser = await profileDal.Model.findOne({ phone });
    const token = generateToken(updatedUser.toJSON());

    return res.status(200).json({ 
      success: true, 
      message: 'Registration completed successfully',
      token,
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('[Auth] Register with OTP error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to complete registration' 
    });
  }
};

module.exports = authController;
