define(['lodash'], function(_) {

  // Switch off global lodash/add mixins

  _.noConflict();
  _.mixin({
    log: function(str) {
      console.log(str);
    },
    typeOf: function(o) {
      return (typeof o);
    },
    instanceOf: function(obj, objName) {
      switch (objName) {
        case 'Array':
          return obj instanceof Array;
          break;
        default:
          return typeof obj === objName;
      }
    },
    // *** @TODO ***
    // Central to the id-ing of different nested objects within the main
    // collection - these ID's inform the view to display, validation rules
    // etc
    getByPath: function(obj, path) {

      if (!obj) {
        return null;
      }

      path = path ? _.compact(path.split(/\["(.+)"\]|\[(.+)\]|\.+/g)) : [];

      // This loop has to ascend
      for (var i = 0; i < path.length; i++) {
        if (
          //typeof obj === 'undefined' ||
          !obj ||
          typeof obj[path[i]] === 'undefined' ||
          typeof obj[path[i]] === null
        ) {
          return null; // prevent empty errors being thrown upstream
        } else {
          obj = obj[!isNaN(path[i]) ? parseInt(path[i]) : path[i]];
        }
      }

      return obj;
    }
  });

  return _;
});