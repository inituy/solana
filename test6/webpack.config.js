const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './index.js',
  devtool: false,
  output: {
    path: __dirname,
    filename: 'index.min.js'
  },
  module: {}
};
