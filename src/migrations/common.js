const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const path = require('path');
const envPath = path.resolve(__dirname, `../../env/.env.${NODE_ENV}`);
require('dotenv').config({ path: envPath });
const mongoose = require('mongoose');

function prepareItemKey(title, type = 'item') {
  if (!title) {
    title = type;
  }
  return title
    .trim()
    .toLowerCase()
    .replace(/[\.\,\`\'\"]+/g, '')
    .replace(/[\s\?\&\_\+\$\#\@\!\%\^\*\(\)\[\]\{\}\>\<\~\|\\\/]+/g, '-');
}

async function incrementItemKey(baseKey, cb) {
  const exist = await cb(baseKey);
  if (exist) {
    return incrementItemKey(`${baseKey}-1`, cb);
  }
  return baseKey;
}

module.exports = {
  mongoose,
  prepareItemKey,
  incrementItemKey,
  up: (next) => {
    next();
  },
  down: (next) => {
    next();
  },
};
