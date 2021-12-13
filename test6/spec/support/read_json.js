var fs = require('fs');

module.exports = function (filepath) {
  return JSON.parse(fs.readFileSync(filepath).toString());
};
