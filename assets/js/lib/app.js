define([

  // Angular
  //'angular', // use the @angular global

  // Services
  'angular-route',
  'angular-resource',

  // Modules
  'angular-flow',

  // Directives (can be loaded asynchronously)
  'angular-directive-dragSelect',
  'angular-directive-msdElastic'
], function(

  angularRoute,
  angularResource,

  angularFlow,
  dragSelect,
  msdElastic
) {

  //window.AWS = require('aws-sdk');

  /*$.fn.extend({
    scrollTo: function(id) {
      $("html, body").animate({
          scrollTop: $('#' + id).offset().top
        },
        1000
      );
    }
  });*/


  // STYLES
  // --------------------------------------------------------------------------

  var bodyStyles = window.getComputedStyle(document.body, null);

  document.getElementById('dynamic-stylesheet').sheet.insertRule(
    '.tree input:checked~ol>li:last-child:before,li input:checked~ul>li:last-child:before{background:' +
    (
      bodyStyles.getPropertyValue('background-color') || // firefox
      bodyStyles.getPropertyValue('background') // chrome
    ) +
    ';}',
    0
  );

  // TOGETHERJS
  // --------------------------------------------------------------------------

  //window.TogetherJSConfig_useMinimizedCode = true;
  //window.TogetherJSConfig_ignoreForms = true;
  //TogetherJS();
  //delete window.TogetherJSConfig_useMinimizedCode;
  //delete window.TogetherJSConfig_ignoreForms;

  // ANGULARJS
  // --------------------------------------------------------------------------

  var app = angular.module(
    'tree', [

      'ngRoute',
      'ngResource',

      //'cfp.loadingBar',
      'flow',
      'monospaced.elastic'
    ]
  );


  app.config(function($routeProvider) {
    $routeProvider.when(
      'home',
      require('angularAMD').route({
        templateUrl: 'templates/home.html',
        controller: 'HomeController',
        controllerUrl: 'scripts/controller'
      })
    );
  });

  app.config(['$resourceProvider', function($resourceProvider) {
    // Don't strip trailing slashes from calculated URLs
    $resourceProvider.defaults.stripTrailingSlashes = false;
  }]);

  //app.config(['flowFactoryProvider', function(flowFactoryProvider) {

  // Can be used with different implementations of Flow.js
  // flowFactoryProvider.factory = fustyFlowFactory;

  //flowFactoryProvider.defaults = {
  //  target: '/upload',
  //  permanentErrors: [404, 500, 501]
  //};

  // @event string [
  //   fileAdded | object file
  //   filesAdded | array files
  //   filesSubmitted | array file
  //   uploadStart | undefined
  //   @ajax call
  //   fileError | object file
  //   error | string (error html)
  //   complete | undefined
  // ]
  // @file object the file
  //flowFactoryProvider.on('catchAll', function(eventType, files, event) {
  //  if (
  //    eventType === 'filesAdded' &&
  //    event.srcElement.id === 'supplierProposedSkus_fileinput'
  //  ) {}
  //});

  //}]);

  // To confirm module has loaded, log: angular.module('flow')

  // directives
  app.directive('dragSelect', dragSelect);

  angular.module('monospaced.elastic', [])
    .constant('msdElasticConfig', {
      append: ''
    })
    .directive('msdElastic', msdElastic);

  // Manually bootstrap angular
  // return angular.bootstrap(document, ['tree']);
  return app;
});