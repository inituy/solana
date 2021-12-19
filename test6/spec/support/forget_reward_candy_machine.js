var path = require('path');
var forgetCandyMachine = require('../../candymachine/forget_candy_machine')

module.exports = function () {
  return Promise.resolve()
    .then(function () {
      return forgetCandyMachine({
        rootPath: path.join(__dirname, './reward'),
        environment: 'devnet',
      })
    })
};
