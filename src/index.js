const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
require('dotenv').config({ path: `env/.env.${NODE_ENV}` });
console.log('Running mode:', NODE_ENV);
const mongoose = require('mongoose');
const { init } = require('./server');

Promise.resolve()
  .then(() => {
    mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true
    });
    console.log('Database Connection Succeed', process.env.DB_CONNECTION);

    mongoose.Promise = global.Promise;
    mongoose.connection.on('error', (err) => {
      console.log('Database Connection Failed:', err);
    });
    return init();
  })
  .catch((err) => {
    process.exit(1);
  });
