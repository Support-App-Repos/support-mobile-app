const twilio = require('twilio');

/**
 * SMS Service using Twilio
 * Handles sending OTP via SMS
 */
class SMSService {
  constructor() {
    // Initialize Twilio client if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    } else {
      this.client = null;
      if (process.env.NODE_ENV !== 'development') {
        console.warn('[SMS] Twilio credentials not configured. SMS will not be sent.');
      }
    }
  }

  /**
   * Send OTP via SMS using Twilio
   * @param {string} phoneNumber - Recipient phone number (E.164 format)
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<{success: boolean, message?: string, sid?: string}>}
   */
  async sendOTP(phoneNumber, otp) {
    try {
      // In development, log OTP instead of sending if Twilio is not configured
      if (!this.client) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SMS] OTP for ${phoneNumber}: ${otp}`);
          return {
            success: true,
            message: 'OTP logged (Twilio not configured)',
          };
        }
        throw new Error('Twilio is not configured');
      }

      // Format phone number to E.164 format if needed
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        // Assume it's a local number, add default country code if needed
        // You may want to adjust this based on your requirements
        formattedPhone = `+1${formattedPhone.replace(/\D/g, '')}`;
      }

      // Send SMS via Twilio
      const message = await this.client.messages.create({
        body: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: this.fromNumber,
        to: formattedPhone,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`[SMS] OTP sent to ${formattedPhone} via Twilio. SID: ${message.sid}`);
      }

      return {
        success: true,
        message: 'OTP sent successfully',
        sid: message.sid,
      };
    } catch (error) {
      console.error('[SMS] Error sending OTP:', error);
      
      // In development, still log the OTP even if Twilio fails
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SMS] Fallback - OTP for ${phoneNumber}: ${otp}`);
        return {
          success: true,
          message: 'OTP logged (Twilio error)',
        };
      }

      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Verify if Twilio is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.client && !!this.fromNumber;
  }

  static getInstance() {
    if (!SMSService._instance) {
      SMSService._instance = new SMSService();
    }
    return SMSService._instance;
  }
}

module.exports = SMSService.getInstance();




