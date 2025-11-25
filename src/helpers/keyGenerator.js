async function _incrementItemKey(baseKey, cb) {
  const exist = await cb(baseKey);
  if (exist) {
    return _incrementItemKey(`${baseKey}-1`, cb);
  }
  return baseKey;
}

function _prepareItemKey(title, type = 'item') {
  if (!title) {
    title = type;
  }
  return title
    .trim()
    .toLowerCase()
    .replace(/[\.\,\`\'\"]+/g, '')
    .replace(/[\s\?\&\_\+\$\#\@\!\%\^\*\(\)\[\]\{\}\>\<\`\~\|\\\/]+/g, '-');
}

async function generateKey(Model, title, type = 'item') {
  const baseKey = _prepareItemKey(title, type);
  const key = await _incrementItemKey(baseKey, (newKey) => {
    return Model.findOne({ key: newKey }, { key: 1 });
  });
  return key;
}

module.exports = {
  _incrementItemKey,
  _prepareItemKey,
  generateKey,
};
