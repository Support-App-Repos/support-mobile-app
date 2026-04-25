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
    'http://localhost:19006', // Expo default port
    'exp://localhost:19000', // Expo dev client
    'http://10.0.2.2:8081', // Android emulator Metro bundler
    'http://10.0.2.2:3000', // Android emulator backend
    // Production admin portal origins
    'http://13.62.185.179',
    'http://13.62.185.179:80',
  ];

  // Add admin portal origin from environment variable if set
  if (process.env.ADMIN_PORTAL_URL) {
    allowedOrigins.push(process.env.ADMIN_PORTAL_URL);
  }

  if (NODE_ENV === 'development') {
    // In development, allow all origins for easier testing
    allowedOrigins.push('*');
  }

  // Handle OPTIONS requests early (before CORS middleware)
  app.options('*', (req, res) => {
    const origin = req.headers.origin || '';
    if (NODE_ENV === 'development' || allowedOrigins.includes(origin) || !origin) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,Accept,Content-Security-Policy');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      return res.status(200).end();
    }
    return res.status(403).end();
  });

  const corsOptions = {
    origin: (origin, callback) => {
      // In development, allow all origins
      if (NODE_ENV === 'development') {
        callback(null, true);
        return;
      }
      // In production, check against allowed origins
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error(ERRORS.CORS_NOT_ALLOWED || 'CORS not allowed'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Origin,Accept,Content-Security-Policy',
  };

  // Configure CORS first, before other middleware
  app.use(cors(corsOptions));

  // Configure Helmet with CORS-friendly settings
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for reset-password page
        scriptSrcAttr: ["'self'", "'unsafe-inline'"], // Allow inline event handlers
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://192.168.1.100:3000", "http://localhost:3000"], // Allow HTTP connections
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: null, // Disable automatic HTTPS upgrade
      },
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  
  // Body parser middleware - MUST be before routes
  // Parse JSON bodies
  app.use(bodyParser.json({
    limit: '50mb',
    type: 'application/json',
  }));
  
  // Parse URL-encoded bodies
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    type: 'application/x-www-form-urlencoded',
  }));
  
  app.use(cookieParser());

  // Stripe webhook route (must be before JSON body parser - uses raw body)
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
      // Store raw body for webhook signature verification
      req.rawBody = req.body;
      next();
    },
    require('./controllers/stripeController').handleWebhook
  );

  // Additional CORS headers middleware (runs after cors() but ensures all headers are set)
  app.use(function (req, res, next) {
    const origin = req.headers.origin || '';
    
    // In development, allow all origins
    if (NODE_ENV === 'development') {
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    } else if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Origin, Accept, X-Requested-With',
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });


  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/auth/signup',
    '/api/auth/signin',
    '/api/auth/send-otp',
    '/api/auth/verify-otp',
    '/api/auth/forgetPassword',
    '/api/auth/reset-password',
    '/api/auth/register-with-otp',
    '/api/auth/google',
  ];

  // Middleware to extract user from token (only for routes that have tokens)
  app.use(async function (req, res, next) {
    const pathWithoutApi = req.path.replace(/^\/api/, '');
    if (publicRoutes.includes(req.path) || 
        publicRoutes.includes(pathWithoutApi) ||
        req.path.startsWith('/api/auth/signup') ||
        req.path.startsWith('/api/auth/signin') ||
        req.path.startsWith('/api/auth/send-otp') ||
        req.path.startsWith('/api/auth/verify-otp') ||
        req.path.startsWith('/api/auth/forgetPassword') ||
        req.path.startsWith('/api/auth/reset-password') ||
        req.path.startsWith('/api/auth/register-with-otp') ||
        req.path.startsWith('/api/auth/google')) {
      return next();
    }

    try {
      const authStr = req.header('Authorization');
      if (authStr) {
        const token = authStr.slice(7);
        try {
          const isValid = verifyToken(token);
          if (isValid) {
            req.userPayload = isValid;
            const cookie = setTokenCookie(token);
            res.setHeader('Set-Cookie', cookie);
            return next();
          }
        } catch (error) {
          // Invalid token, continue
        }
      }

      const token = getTokenFromCookie(req);
      if (token) {
        try {
          const isValid = verifyToken(token);
          if (isValid) {
            req.userPayload = isValid;
          }
        } catch (error) {
          // Invalid token, continue
        }
      }
      next();
    } catch (err) {
      next();
    }
  });

  // Stripe webhook route (must be before JSON body parser, uses raw body)
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
      // Store raw body for webhook signature verification
      req.rawBody = req.body;
      next();
    },
    require('./controllers/stripeController').handleWebhook
  );

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
    res.sendFile(filePath);
  });

  app.get('/support', (req, res) => {
    const filePath = path.join(__dirname, './views/support.html');
    res.sendFile(filePath);
  });

  app.get('/healthcheck', (req, res) => {
    res.sendStatus(200);
  });

  // Test endpoint for connectivity verification
  app.get('/api/test', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Backend is reachable!',
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/test', (req, res) => {
    res.json({ 
      success: true, 
      message: 'POST request received!',
    });
  });

  const httpServer = http.createServer(app);
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`We have a ${NODE_ENV} server running on PORT: ${PORT}`);
    console.log(`Server is listening on all interfaces (0.0.0.0:${PORT})`);
    console.log(`Accessible via:`);
    console.log(`  - http://localhost:${PORT} (local machine)`);
    console.log(`  - http://10.0.2.2:${PORT} (Android emulator)`);
    console.log(`  - http://<your-ip>:${PORT} (network devices)`);
  });
}

module.exports = {
  init,
};
