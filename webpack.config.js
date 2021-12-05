var path = require('path');

module.exports = {
  mode: 'development',
  entry: './coso.js',
  output: {
    path: path.join(__dirname),
    filename: 'asd.js',
  }
};
