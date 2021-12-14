var fs = require('fs');
var path = require('path');

module.exports = function (params) {
  var cacheDir = path.join(params.rootPath, '.cache');
  var cachePath = path.join(cacheDir, `${params.environment}-temp`);
  return Promise.resolve()
    .then(function () {
      try {
        fs.unlinkSync(cachePath);
        fs.rmdirSync(cacheDir);
      }
      catch (e) {}
    });
};
