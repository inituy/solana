var fs = require('fs');
var path = require('path');

module.exports = function (params) {
  var cacheDir = path.join(params.rootPath, '.cache');
  var cachePath = path.join(cacheDir, `${params.environment}-temp`);
  var cachePathAlt = path.join(cacheDir, `${params.environment}-temp.json`);
  return Promise.resolve()
    .then(function () {
      try { fs.unlinkSync(cachePath); }
      catch (e) { console.log(new Date(), 'Could not delete:', cachePath); }
      try { fs.unlinkSync(cachePathAlt); }
      catch (e) { console.log(new Date(), 'Could not delete:', cachePathAlt); }
      try { fs.rmdirSync(cacheDir); }
      catch (e) { console.log(new Date(), 'Could not delete:', cacheDir); }
    });
};
