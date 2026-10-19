/**
 * Auth Controller - Prisma Version
 * Updated to use Prisma ORM and OtpVerification model
 * Uses MongoDB directly for writes to bypass replica set requirement
 */

const { prisma } = require('../lib/prisma');
const { getMongoDb, getCollection } = require('../lib/mongodb');
const { COMMON, ERRORS } = require('../consts');
const {
  Unauthorized,
  UnprocessableEntity,
  NotFound,
  BadRequest,
} = require('../helpers/errors');
const emailService = require('../helpers/email');
const smsService = require('../helpers/sms');
const { OAuth2Client } = require('google-auth-library');
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

    // Get MongoDB database and collection
    const userCollection = await getCollection('User');

    // Check if user already exists
    const existingUser = await userCollection.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(phoneNumber ? [{ phone_number: phoneNumber }] : [])
      ]
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

    // Create user using MongoDB directly (bypasses replica set requirement)
    const userData = {
      email: email.toLowerCase(),
      phone_number: phoneNumber || null,
      password_hash: `${hashedPassword}:${salt}`, // Store hash:salt together
      full_name: fullName,
      is_verified: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await userCollection.insertOne(userData);
    const createdUser = await userCollection.findOne({ _id: result.insertedId });

    // Format user response
    const user = {
      id: createdUser._id.toString(),
      email: createdUser.email,
      phoneNumber: createdUser.phone_number,
      fullName: createdUser.full_name,
      profileImageUrl: createdUser.profile_image_url || null,
      isVerified: createdUser.is_verified,
      isActive: createdUser.is_active,
      createdAt: createdUser.created_at,
    };

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

    // Get MongoDB collection
    const userCollection = await getCollection('User');

    const userDoc = await userCollection.findOne({ email: email.toLowerCase() });

    if (!userDoc) {
      return res.status(404).json({ 
        success: false, 
        message: ERRORS.USER_NOT_EXIST || 'User not found' 
      });
    }

    // Extract hash and salt from passwordHash
    if (!userDoc.password_hash || !userDoc.password_hash.includes(':')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password format' 
      });
    }

    const [storedHash, salt] = userDoc.password_hash.split(':');
    const userWithSalt = { ...userDoc, password: storedHash, salt };

    const isValid = validatePassword(userWithSalt, password);
    
    // Format user response
    const user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      phoneNumber: userDoc.phone_number,
      fullName: userDoc.full_name,
      profileImageUrl: userDoc.profile_image_url || null,
      isVerified: userDoc.is_verified,
      isActive: userDoc.is_active,
      createdAt: userDoc.created_at,
    };
    
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

    // Get MongoDB collection
    const otpCollection = await getCollection('OtpVerification');

    // Delete any existing unverified OTPs for this phone
    await otpCollection.deleteMany({
      phone_number: phone,
      is_verified: false,
      expires_at: { $gt: new Date() }
    });

    // Create new OTP record using MongoDB directly
    await otpCollection.insertOne({
      phone_number: phone,
      otp_code: otp,
      purpose: purpose, // 'login', 'registration', 'password_reset'
      is_verified: false,
      expires_at: expiresAt,
      created_at: new Date(),
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

    // Get MongoDB collection
    const otpCollection = await getCollection('OtpVerification');

    // Find the most recent unverified OTP for this phone
    const otpRecords = await otpCollection.find({
      phone_number: phone,
      is_verified: false,
      expires_at: { $gt: new Date() }
    }).sort({ created_at: -1 }).limit(1).toArray();
    
    if (!otpRecords || otpRecords.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'OTP not found or expired. Please request a new OTP.' 
      });
    }

    const otpRecord = otpRecords[0];

    if (otpRecord.otp_code !== otp) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    // Mark OTP as verified
    await otpCollection.updateOne(
      { _id: otpRecord._id },
      { $set: { is_verified: true } }
    );

    if (flow === 'login') {
      const userCollection = await getCollection('User');
      
      // Find or create user
      let userDoc = await userCollection.findOne({ phone_number: phone });

      if (!userDoc) {
        // Create user if doesn't exist (for login flow)
        const newUserData = {
          phone_number: phone,
          is_verified: true,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        };
        const result = await userCollection.insertOne(newUserData);
        userDoc = await userCollection.findOne({ _id: result.insertedId });
      } else {
        // Update user verification status
        await userCollection.updateOne(
          { _id: userDoc._id },
          { $set: { is_verified: true, updated_at: new Date() } }
        );
        userDoc = await userCollection.findOne({ _id: userDoc._id });
      }

      // Format user response
      const user = {
        id: userDoc._id.toString(),
        email: userDoc.email || null,
        phoneNumber: userDoc.phone_number,
        fullName: userDoc.full_name || null,
        profileImageUrl: userDoc.profile_image_url || null,
        isVerified: userDoc.is_verified,
        isActive: userDoc.is_active,
        createdAt: userDoc.created_at,
      };

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

    // Get MongoDB collection
    const otpCollection = await getCollection('OtpVerification');
    const userCollection = db.collection('User');

    // Check if OTP was verified
    const verifiedOtps = await otpCollection.find({
      phone_number: phone,
      is_verified: true,
      purpose: 'registration'
    }).sort({ created_at: -1 }).limit(1).toArray();

    if (!verifiedOtps || verifiedOtps.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify OTP first' 
      });
    }

    // Check if user already exists
    let userDoc = await userCollection.findOne({ phone_number: phone });

    if (!userDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please verify OTP first.' 
      });
    }

    // Hash password
    const { password: hashedPassword, salt } = await getHashPasswordAndSalt(password);
    
    // Build fullName
    let fullName = userDoc.full_name;
    if (firstName && lastName) {
      fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    } else if (firstName) {
      fullName = firstName.trim();
    } else if (lastName) {
      fullName = lastName.trim();
    }

    // Update user
    const updateData = {
      password_hash: `${hashedPassword}:${salt}`,
      is_verified: true,
      updated_at: new Date(),
    };

    if (fullName) updateData.full_name = fullName;
    if (email) updateData.email = email.toLowerCase();

    await userCollection.updateOne(
      { _id: userDoc._id },
      { $set: updateData }
    );

    userDoc = await userCollection.findOne({ _id: userDoc._id });

    // Format user response
    const user = {
      id: userDoc._id.toString(),
      email: userDoc.email || null,
      phoneNumber: userDoc.phone_number,
      fullName: userDoc.full_name || null,
      profileImageUrl: userDoc.profile_image_url || null,
      isVerified: userDoc.is_verified,
      isActive: userDoc.is_active,
      createdAt: userDoc.created_at,
    };

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

    // Get MongoDB collection
    const userCollection = await getCollection('User');

    const user = await userCollection.findOne({ email: email.toLowerCase() });

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
    
    // Get MongoDB collection
    const userCollection = await getCollection('User');

    const user = await userCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { password: hashedPassword, salt } = await getHashPasswordAndSalt(newPassword);
    
    await userCollection.updateOne(
      { _id: user._id },
      { $set: { password_hash: `${hashedPassword}:${salt}`, updated_at: new Date() } }
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

/**
 * Google Sign-In (mobile): verifies Google ID token, finds or creates user, returns app JWT.
 * Set GOOGLE_WEB_CLIENT_ID (OAuth 2.0 Web client ID from Google Cloud Console).
 * Optional: GOOGLE_ANDROID_CLIENT_ID if your idToken aud is the Android client ID.
 */
authController.googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'idToken is required',
      });
    }

    const webClientId = (process.env.GOOGLE_WEB_CLIENT_ID || '').trim();
    if (!webClientId) {
      console.error('[Auth] GOOGLE_WEB_CLIENT_ID is not set');
      return res.status(500).json({
        success: false,
        message: 'Google sign-in is not configured on the server',
      });
    }

    const audiences = [webClientId];
    if (process.env.GOOGLE_ANDROID_CLIENT_ID?.trim()) {
      audiences.push(process.env.GOOGLE_ANDROID_CLIENT_ID.trim());
    }
    if (process.env.GOOGLE_IOS_CLIENT_ID?.trim()) {
      audiences.push(process.env.GOOGLE_IOS_CLIENT_ID.trim());
    }

    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: audiences,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
    }
    if (!payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Google email is not verified',
      });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const fullName = (payload.name || '').trim() || null;
    const profileImageUrl = payload.picture || null;

    const userCollection = await getCollection('User');
    let userDoc = await userCollection.findOne({ email });

    if (!userDoc) {
      const result = await userCollection.insertOne({
        email,
        full_name: fullName,
        profile_image_url: profileImageUrl,
        google_id: googleId,
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      userDoc = await userCollection.findOne({ _id: result.insertedId });
    } else {
      const updates = {
        google_id: googleId,
        updated_at: new Date(),
      };
      if (profileImageUrl && !userDoc.profile_image_url) {
        updates.profile_image_url = profileImageUrl;
      }
      if (fullName && !userDoc.full_name) {
        updates.full_name = fullName;
      }
      await userCollection.updateOne({ _id: userDoc._id }, { $set: updates });
      userDoc = await userCollection.findOne({ _id: userDoc._id });
    }

    const user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      phoneNumber: userDoc.phone_number ?? null,
      fullName: userDoc.full_name ?? null,
      profileImageUrl: userDoc.profile_image_url || null,
      isVerified: userDoc.is_verified,
      isActive: userDoc.is_active,
      createdAt: userDoc.created_at,
    };

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (err) {
    console.error('[Auth] Google sign-in error:', err.message || err);
    return res.status(401).json({
      success: false,
      message: err.message || 'Google sign-in failed',
    });
  }
};

module.exports = authController;

