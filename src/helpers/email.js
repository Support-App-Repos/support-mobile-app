const path = require('path');
const { createTransport } = require('nodemailer');
const mustacheExpress = require('mustache-express');
const { COMMON } = require('../consts');

const LayoutTemplate = 'Layout';
// This is where to import email templates
class EmailService {
  constructor() {
    const options = {
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    };
    this.fromName = process.env.SMTP_FROM_NAME;
    this.fromEmail = process.env.SMTP_FROM_EMAIL;
    this.transporter = createTransport(options);

    this.templateEngine = mustacheExpress(
      path.resolve(__dirname, '../emails'),
      '.html',
    );
  }

  /**
   * @param {Object} props
   * @param {string} props.email
   * @returns {Promise<void>}
   */
  async sendUserRegisterEmail(props) {
    const template = await this.getTemplate('UserRegister', {
      title: `Welcome to Youzell`,
      ...props,
    });
    const options = {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: props.email,
      subject: 'Welcome to Youzell: Your Registration',
      html: template,
    };
    await this.transporter.sendMail(options);
    // console.log(JSON.stringify(info));
  }

  async sendResetPasswordEmail(props) {
    const template = await this.getTemplate('ResetPassword', {
      title: `<span class="highlight">Reset you password</span>`,
      ...props,
    });
    const options = {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: props.email,
      subject: COMMON.RESET_PASSWORD_SUBJECT,
      html: template,
    };
    await this.transporter.sendMail(options);
  }

  async sendPlaceOrderEmail(props) {
    const template = await this.getTemplate('PlaceOrder', {
      title: `<span class="highlight">Order Placed</span>`,
      ...props,
    });
    const options = {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: props.email,
      subject: "Welcome to Youzell: Order Placed Successfully!",
      html: template,
    };
    await this.transporter.sendMail(options);
  }

  async sendStoreVerificationApprovedEmail(props) {
    const template = await this.getTemplate('StoreVerificationApproved', {
      title: `<span class="highlight">Store Verified</span>`,
      ...props,
    });
    const options = {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: props.email,
      subject: 'Your Youzell store has been verified',
      html: template,
    };
    await this.transporter.sendMail(options);
  }

  async sendStoreVerificationRejectedEmail(props) {
    const template = await this.getTemplate('StoreVerificationRejected', {
      title: `<span class="highlight">Store Verification Update</span>`,
      ...props,
    });
    const options = {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: props.email,
      subject: 'Action required: Your Youzell store verification',
      html: template,
    };
    await this.transporter.sendMail(options);
  }

  async getTemplate(templateName, options, withLayout = true) {
    const templatePath = path.resolve(
      __dirname,
      `../emails/${templateName}.html`,
    );
    const finalOptions = {
      ...options,
      baseUrl: process.env.HOST,
    };
    return Promise.resolve().then(() => {
      return new Promise((resolve, reject) => {
        this.templateEngine(templatePath, finalOptions, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }).then((data) => {
        if (withLayout) {
          return this.getLayoutTemplate({ content: data, ...finalOptions });
        } else {
          return data;
        }
      });
    });
  }

  getLayoutTemplate(props) {
    const templatePath = path.resolve(
      __dirname,
      `../emails/${LayoutTemplate}.html`,
    );
    return new Promise((resolve, reject) => {
      this.templateEngine(templatePath, props, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  static getInstance() {
    if (!EmailService._instance) {
      EmailService._instance = new EmailService();
    }
    return EmailService._instance;
  }

}``

module.exports = EmailService.getInstance();
