define([
  'angularAMD'
], function(
  angularAMD
) {

  // This 'angular' is the angular global
  var app = angular.module(app_name, ['webapp']);

  //... // Setup app here. E.g.: run .config with $routeProvider

  var app = angular.module(
    'tree', [
      //'cfp.loadingBar',
      //'ngAnimate,
      'ngResource',
      'ngRoute',
      'flow',
      'monospaced.elastic'
    ]
  );

  return angularAMD.bootstrap(app);
});