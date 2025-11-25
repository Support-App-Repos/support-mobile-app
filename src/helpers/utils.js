
const toFirstLower = (val) => {
    if (!val) {
      return val;
    }
    const str = val.trim();
    return str[0].toLowerCase() + str.slice(1);
  };
  
  const toFirstUpper = (val) => {
    if (!val) {
      return val;
    }
    const str = val.trim();
    return str[0].toUpperCase() + str.slice(1);
  };
  function trailString(text) {
    return text.replace(/\d+\./g, '').replace(/\n/g, ' ').trim();
  }
  
  
  module.exports = {
    toFirstLower,
    toFirstUpper,
    trailString
  };
  