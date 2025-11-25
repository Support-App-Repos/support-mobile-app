const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
require('dotenv').config({ path: `env/.env.${NODE_ENV}` });
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const passport = require('passport');
const path = require('path');
const { ERRORS } = require('./consts');
const app = express();
const routes = require('./routes');
require('./helpers/auth/passport');
const { verifyToken, setTokenCookie, getTokenFromCookie } = require('./helpers/token');
const { createTransport } = require('nodemailer');

async function init() {
  const PORT = process.env.PORT;
  const {
    router
  } = routes;


  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
    })
  );

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
  ];

  if (NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:8080', 'http://localhost:3001');
  }

  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error(ERRORS.CORS_NOT_ALLOWED));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Origin,Accept,Content-Security-Policy',
  };

  app.use(cors(corsOptions));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(helmet());
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhooks') {
      next();
    } else {
      bodyParser.json({
        limit: '50mb',
      })(req, res, next); // ONLY do bodyParser.json() if the received request is NOT a WebHook from Stripe.
    }
  });
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    }),
  );

  app.use(cookieParser());

  app.use(function (req, res, next) {

    const origin = req.headers.origin || '';
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader(
      'Access-Control-Allow-Headers',
      'content-type, authorization, origin, accept',
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'POST, GET, DELETE, PUT, OPTIONS',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    // }
    next();
  });


  app.use(async function (req, res, next) {
    try {
      const authStr = req.header('Authorization');
      if (authStr) {
        const token = authStr.slice(7);
        const isValid = verifyToken(token);
        if (isValid) {
          req.userPayload = isValid;
          const cookie = setTokenCookie(token);
          res.setHeader('Set-Cookie', cookie);
          next();
          return;
        }
      }

      const token = getTokenFromCookie(req);

      if (token) {
        const isValid = verifyToken(token);
        if (isValid) {
          req.userPayload = isValid;
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  app.use('/api', router);

  // Handle form submission
  app.post('/send-email', async (req, res) => {
    const { email, name, query } = req.body;

    if (!name || !email || !query) {
      return res.status(400).send('Name and query are required.');
    }

    // Configure the email transporter
    const transporter = createTransport({
      service: process.env.SMTP_SERVICE, // Or another email provider (e.g., Outlook, Yahoo)
      auth: {
        user: process.env.SMTP_USERNAME, // Replace with your email
        pass: process.env.SMTP_PASSWORD  // Replace with your email password or app-specific password
      }
    });
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send('Invalid email address.');
    }
    const mailOptions = {
      from: email,
      to: process.env.SMTP_USERNAME, // Replace with the recipient's email
      subject: `Support Query from ${name}`,
      text: `Name: ${name}\n\nQuery: ${query}`
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send('Your query has been sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Failed to send your query. Please try again.');
    }
  });
  app.get('/reset-password', (req, res) => {
    const filePath = path.join(__dirname, './views/reset-password.html');
    console.log('Resolved file path:', filePath); // Add this to debug the path
    res.sendFile(filePath);
  });

  app.get('/support', (req, res) => {
    const filePath = path.join(__dirname, './views/support.html');
    console.log('Resolved file path:', filePath); // Add this to debug the path
    res.sendFile(filePath);
  });

  app.get('/healthcheck', (req, res) => {
    res.sendStatus(200);
  });

  const httpServer = http.createServer(app);
  httpServer.listen(PORT, () => {
    console.log(`We have a ${NODE_ENV} server running on PORT: ${PORT}`);
  });
}

module.exports = {
  init,
};
