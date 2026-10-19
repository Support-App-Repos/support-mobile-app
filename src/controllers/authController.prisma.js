/**
 * Auth Controller - Prisma Version
 * Updated to use Prisma ORM and OtpVerification model
 */

const { prisma } = require('../lib/prisma');
const { COMMON, ERRORS } = require('../consts');
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

const authController = {};

// Email/Password Signup
authController.signup = async (req, res, next) => {
  try {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    const { email, password, phoneNumber, firstName, lastName, username } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          ...(phoneNumber ? [{ phoneNumber }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists with this email or phone number' 
      });
    }

    // Hash password
    const { password: hashedPassword, salt } = await getHashPasswordAndSalt(password);
    
    // Build fullName from firstName and lastName
    let fullName = null;
    if (firstName && lastName) {
      fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    } else if (firstName) {
      fullName = firstName.trim();
    } else if (lastName) {
      fullName = lastName.trim();
    } else if (username) {
      fullName = username.trim();
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        phoneNumber: phoneNumber || null,
        passwordHash: `${hashedPassword}:${salt}`, // Store hash:salt together
        fullName: fullName,
        isVerified: false,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        profileImageUrl: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      }
    });

    // Send welcome email
    try {
      const nameForEmail = fullName || email;
      await emailService.sendUserRegisterEmail({
        email: email,
        name: nameForEmail
      });
    } catch (error) {
      console.error('[Auth] Email send error:', error);
    }

    const token = generateToken(user);
    
    return res.status(200).json({ 
      success: true, 
      user, 
      token,
      message: 'Sign up successful' 
    });
  } catch (error) {
    console.error('[Auth] Signup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || ERRORS.SIGN_UP || 'Signup failed' 
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
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: ERRORS.USER_NOT_EXIST || 'User not found' 
      });
    }

    // Extract hash and salt from passwordHash
    if (!user.passwordHash || !user.passwordHash.includes(':')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password format' 
      });
    }

    const [storedHash, salt] = user.passwordHash.split(':');
    const userWithSalt = { ...user, password: storedHash, salt };

    const isValid = validatePassword(userWithSalt, password);
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: ERRORS.INCORRECT_EMAIL_OR_PASSWORD || 'Incorrect email or password' 
      });
    }

    const token = generateToken(user);
    
    return res.status(200).json({ 
      success: true, 
      user, 
      token,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('[Auth] Signin error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || ERRORS.SIGN_IN || 'Signin failed' 
    });
  }
};

// Send OTP to phone number
authController.sendOTP = async (req, res) => {
  try {
    const { phone, purpose = 'registration' } = req.body;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unverified OTPs for this phone
    await prisma.otpVerification.deleteMany({
      where: {
        phoneNumber: phone,
        isVerified: false,
        expiresAt: { gt: new Date() }
      }
    });

    // Create new OTP record
    await prisma.otpVerification.create({
      data: {
        phoneNumber: phone,
        otpCode: otp,
        purpose: purpose, // 'login', 'registration', 'password_reset'
        isVerified: false,
        expiresAt: expiresAt,
      }
    });

    // Send OTP via SMS
    try {
      await smsService.sendOTP(phone, otp);
    } catch (smsError) {
      console.error('[Auth] SMS send error:', smsError);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Auth] OTP for ${phone}: ${otp}`);
      } else {
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
    const { phone, otp, flow = 'login' } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and OTP are required' 
      });
    }

    // Find the most recent unverified OTP for this phone
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phoneNumber: phone,
        isVerified: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!otpRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'OTP not found or expired. Please request a new OTP.' 
      });
    }

    if (otpRecord.otpCode !== otp) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    // Mark OTP as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isVerified: true }
    });

    if (flow === 'login') {
      // Find or create user
      let user = await prisma.user.findFirst({
        where: { phoneNumber: phone }
      });

      if (!user) {
        // Create user if doesn't exist (for login flow)
        user = await prisma.user.create({
          data: {
            phoneNumber: phone,
            isVerified: true,
            isActive: true,
          },
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            fullName: true,
            profileImageUrl: true,
            isVerified: true,
            isActive: true,
            createdAt: true,
          }
        });
      } else {
        // Update user verification status
        user = await prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true },
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            fullName: true,
            profileImageUrl: true,
            isVerified: true,
            isActive: true,
            createdAt: true,
          }
        });
      }

      const token = generateToken(user);
      return res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully',
        token,
        user
      });
    }

    // For registration flow, just verify OTP (password will be set in registerWithOTP)
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

    // Check if OTP was verified
    const verifiedOtp = await prisma.otpVerification.findFirst({
      where: {
        phoneNumber: phone,
        isVerified: true,
        purpose: 'registration'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!verifiedOtp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify OTP first' 
      });
    }

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: { phoneNumber: phone }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please verify OTP first.' 
      });
    }

    // Hash password
    const { password: hashedPassword, salt } = await getHashPasswordAndSalt(password);
    
    // Build fullName
    let fullName = user.fullName;
    if (firstName && lastName) {
      fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    } else if (firstName) {
      fullName = firstName.trim();
    } else if (lastName) {
      fullName = lastName.trim();
    }

    // Update user
    const updateData = {
      passwordHash: `${hashedPassword}:${salt}`,
      isVerified: true,
    };

    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email.toLowerCase();

    user = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        profileImageUrl: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      }
    });

    const token = generateToken(user);

    return res.status(200).json({ 
      success: true, 
      message: 'Registration completed successfully',
      token,
      user
    });
  } catch (error) {
    console.error('[Auth] Register with OTP error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to complete registration' 
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

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: ERRORS.USER_NOT_EXIST || 'User not found' 
      });
    }
    
    const resetToken = generateToken(user);
    
    // Build reset URL
    let resetPageUrl;
    if (process.env.SERVER_URL) {
      resetPageUrl = `${process.env.SERVER_URL}/reset-password?${COMMON.RESET_TOKEN}=${resetToken}`;
    } else if (process.env.SERVER_IP) {
      const port = process.env.PORT || 3000;
      resetPageUrl = `http://${process.env.SERVER_IP}:${port}/reset-password?${COMMON.RESET_TOKEN}=${resetToken}`;
    } else if (process.env.HOST && !process.env.HOST.includes('localhost')) {
      resetPageUrl = `${process.env.HOST}/reset-password?${COMMON.RESET_TOKEN}=${resetToken}`;
    } else {
      const port = process.env.PORT || 3000;
      const serverIP = '192.168.1.100';
      resetPageUrl = `http://${serverIP}:${port}/reset-password?${COMMON.RESET_TOKEN}=${resetToken}`;
    }
    
    try {
      await emailService.sendResetPasswordEmail({
        email: user.email,
        recipientFirstName: user.fullName || user.email || 'User',
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
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { password: hashedPassword, salt } = await getHashPasswordAndSalt(newPassword);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: `${hashedPassword}:${salt}`
      }
    });

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

module.exports = authController;

