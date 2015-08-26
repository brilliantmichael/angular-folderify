(function() {

  var fs = require("fs");
  var crypto = require('crypto');
  var json = JSON.parse(fs.readFileSync("Issues.min.json"));

  function iterate(obj, fn) {
    function iter(that) {
      for (var k in that) {
        if (typeof(that[k]) !== 'function') {
          that[k] = fn(that[k]);
          if (!!that[k] && typeof(that[k]) === 'object') {
            iter(that[k]);
          }
        }
      }
    }
    iter(obj);
  }

  iterate(json, function(v) {

    var md5 = crypto.createHash('md5')

    if (typeof v === 'string') {
      v = md5.update(v).digest('hex').substring(0, 12);
    }

    return v;
  });


  fs.writeFileSync("Issues.hashed.json", JSON.stringify(json), "utf8");

}.call(this));