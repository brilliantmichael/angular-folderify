require.config({
  baseUrl: 'assets/js/vendor',
  urlArgs: (window.developmentMode ? ( 't=' + new Date().getTime()) : ''), // prevent caching for testing,

  // Configures different root paths, or shortcuts, for module names when
  // required from the default baseUrl default path
  paths: {

    // Google+
    'googleplus-signin': '//apis.google.com/js/client:platform',
    'auth-init': '../lib/auth.init',

    // Polyfills
    'json2': [
      //'//cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.min',
      'json2'
    ],
    'es5-shim': [
      //'//cdnjs.cloudflare.com/ajax/libs/es5-shim/4.1.0/es5-shim.min',
      'es5-shim-4.1.0'
    ],
    'async': [
      //'//cdnjs.cloudflare.com/ajax/libs/async/0.9.0/async.js',
      'async-0.9.0'
    ],

    // Major libraries
    'jquery': [
      //'//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min',
      // Fallbacks
      //'//code.jquery.com/jquery-2.1.3.min',
      //'//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min',
      'jquery-2.1.3'
    ],

    'lodash': [
      //'//cdnjs.cloudflare.com/ajax/libs/lodash.js/3.1.0/lodash.min',
      'lodash-3.1.0',
      //'//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min',
      //'underscore-1.7.0'
    ],
    // Remove lodash global and add mixins
    'lodash.custom': '../lib/lodash.init',

    // Angular

    'angular': [
      //'//ajax.googleapis.com/ajax/libs/angularjs/1.3.9/angular',
      //'//code.angularjs.org/1.3.9/angular.min.js',
      //'//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.9/angular.min',
      'angular/angular-1.3.9'
    ],

    // AngularAMD - RequireJS integration simplifier

    'angularAMD': [
      //'//cdn.jsdelivr.net/angular.amd/0.2/angularAMD.min.js',
      'angularAMD-0.2.1.min'
    ],
    'app': '../lib/app',

    // Official Angular Modules

    'angular-route': [
      //'//ajax.googleapis.com/ajax/libs/angularjs/1.3.9/angular-route.min.js',
      //'//code.angularjs.org/1.3.9/angular-route.min.js',
      //'//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.9/angular-route.min',
      'angular/angular-route-1.3.9'
    ],
    'angular-resource': [
      //'//ajax.googleapis.com/ajax/libs/angularjs/1.3.9/angular-resource.min.js',
      //'//code.angularjs.org/1.3.9/angular-resource.min.js'
      //'//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.9/angular-resource.min.js',
      'angular/angular-resource-1.3.9'
    ],
    'angular-animate': [
      //'//ajax.googleapis.com/ajax/libs/angularjs/1.3.9/angular-animate.min.js',
      //'//code.angularjs.org/1.3.9/angular-animate.min.js',
      //'//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.9/angular-animate.min',
      'angular/angular-animate-1.3.9'
    ],




    'angular-directive-dragSelect': '../lib/angular/directives/angular.directive.drag-select',
    'angular-directive-msdElastic': '../lib/angular/directives/angular.directive.msd-elastic',
    'angular-flow': [
      //'//cdnjs.cloudflare.com/ajax/libs/ng-flow/2.6.0/ng-flow-standalone.min',
      '../lib/angular/ng-flow-standalone-2.6.0'
    ],
    'angular.utils.data-ajax': '../lib/angular/utils/angular.utils.data-ajax',
    'angular.schema.viewFunctions.data.Suppliers[].proposedSkus': '../lib/angular/angular.schema.viewFunctions.data.Suppliers[].proposedSkus',
    'angular.schema.viewFunctions.data.Products': '../lib/angular/angular.schema.viewFunctions.data.Products',
    'angular-scope-schema': '../lib/angular/angular.config.schema',

    // Mozilla TogetherJS
    //'TogetherJS': [
    //  '//togetherjs.com/togetherjs-min'
    //],

    // Fuzzyset string matching
    'fuzzyset': 'fuzzyset-0.0.1',

    // Amazon JavaScript SDK
    'aws-sdk': [
      //'//sdk.amazonaws.com/js/aws-sdk-2.1.8.min',
      'aws-sdk-2.1.8'
    ],

    // moment.js
    'momentjs': [
      //'//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment-with-locales.min.js',
      'moment-with-locales-2.9.0'
    ],

    // SheetJS
    'SheetJS.jszip': [
      //'//cdnjs.cloudflare.com/ajax/libs/jszip/2.4.0/jszip.min',
      'SheetJS/jszip'
    ],
    'SheetJS.xls': [
      //'//cdnjs.cloudflare.com/ajax/libs/xls/0.7.2/xls',
      'SheetJS/xls'
    ],
    'SheetJS.xlsx': [
      //'//cdnjs.cloudflare.com/ajax/libs/xlsx/0.7.12/xlsx',
      'SheetJS/xlsx'
    ],

    // FileSaver
    'FileSaver.Blob': 'FileSaver/Blob', // required for FileSaver.js
    'FileSaver.FileSaver': [
      // required to export worksheets
      //'//cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min',
      'FileSaver/FileSaver'
    ],

    // Papaparse CSV parser
    'papaparse': [
      //'//cdnjs.cloudflare.com/ajax/libs/PapaParse/4.1.0/papaparse.min',
      'papaparse-4.1.0.custom'
    ],

    // filereader util
    'tabular-file-reader': '../lib/tabularFileReader.utils',

    // d3
    'd3.aight': [
      //'//cdnjs.cloudflare.com/ajax/libs/aight/1.2.2/aight.d3.min',
      'd3/aight.d3'
    ],

    // alertify.js
    'alertify': 'alertify-1.1.0',

    // masonry.js
    'masonry': [
      //'//cdnjs.cloudflare.com/ajax/libs/masonry/3.2.2/masonry.pkgd.min.js',
      'masonry.pkgd-3.2.2'
    ],

    // domReady
    'domReady': [
      //'//cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady.min',
      'domReady-2.0.1'
    ],

    // Bootstrap 3
    'bootstrap': [
      //'//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min',
      //'//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.2/js/bootstrap.min',
      'bootstrap'
    ]
  },
  //map: {
  //  '*': {
  //    'jquery': 'jquery-private'
  //  }
  //},
  shim: {

    // Modules and their dependent modules /
    // Autoload dependencies for groups of files for one module

    'FileSaver.FileSaver': ['FileSaver.Blob'],
    'SheetJS.xls': {
      deps: ['SheetJS.jszip'],
      exports: 'XLS'
    },
    'SheetJS.xlsx': {
      deps: ['SheetJS.jszip'],
      exports: 'XLSX'
    },

    // ------------------------------------------------------------------------

    // angular does not support AMD out of the box, put it in a shim
    'angular': {
      exports: 'angular'
    },

    // Modules
    // -------

    // AngularAMD
    'angularAMD':  {
      deps: ['angular']
    },

    // File upload
    'angular-flow': {
      deps: ['angular']
    },

    // Services
    // --------

    'angular-route': {
      deps: ['angular']
    },
    'angular-resource': {
      deps: ['angular']
    },
    'angular-animate': {
      deps: ['angular']
    },

    // ------------------------------------------------------------------------

    'googleplus-signin': {
      deps: ['auth-init'],
      exports: 'gapi'
    },

    // require(['aws-sdk']) @return AWS
    'aws-sdk': {
      exports: 'AWS'
    },


    'app': {
      deps: [
        'assets/js/lib/polyfill.custom.js',
        'lodash.custom'
      ]
    }
  },
  deps: ['app', '../page/home', 'googleplus-signin'] // initialise application
});