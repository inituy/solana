var exec = require('child_process').exec;
var path = require('path');

module.exports = function (params) {
  return Promise.resolve()
    .then(function () {
      var cmdParts = [
        `node ${path.join(__dirname, '../node_modules/ts-node/dist/bin.js')}`,
        path.join(__dirname, '../metaplex/js/packages/cli/src/candy-machine-cli.ts'),
      ];
      var cmd = cmdParts.concat(params.params).join(' ');
      var options = { cwd: params.cwd };
      return new Promise(function (resolve, reject) {
        exec(cmd, options, function (error, stdout, stderr) {
          if (!!error) reject(error);
          // console.log('---ERROR---', error);
          // console.log('---STDOUT---', stdout);
          // console.log('---STDERR---', stderr);
          resolve(stdout);
        });
      });
    });
};
