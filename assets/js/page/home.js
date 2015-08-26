define([
  // AngularAMD
  'angularAMD',
  // https://github.com/marcoslin/angularAMD
  'app',
  // Controller property configuration
  'angular-scope-schema',

  'lodash.custom',
  'alertify',
  'momentjs'

], function(

  angularAMD,
  app,
  schema,

  _,
  alertify,
  momentjs
) {


  app.controller(

    'TreeController',

    // @$scope the scope of the template encapsulated by this controller
    function(
      $scope,
      $http,
      $q,
      $route,
      $resource // $resource(url, [paramDefaults], [actions], options);
      //,cfpLoadingBar
    ) {

      // Provides methods ["get", "save", "query", "remove", "delete", "bind"]
      var Data = $resource(
        '//danmurphys-marketplace.s3.amazonaws.com/data/collections/:collection.min.json'
      );
      var FormData = $resource(
        '//danmurphys-marketplace.s3.amazonaws.com/form-data/:schemakey/:schemakey.:supplierid.json'
      );

      console.log(Data);

      //window.$scope = $scope; // FOR TESTING
      //console.log(cfpLoadingBar.start());

      // https://github.com/chieffancypants/angular-loading-bar
      // http://sroze.github.io/ngInfiniteScroll/demo_basic.html
      // https://github.com/jasmine/jasmine

      // PROPERTIES
      // ----------------------------------------------------------------------

      //var collectionName = location.href.substring(
      //  location.href.lastIndexOf('/') + 1,
      //  location.href.lastIndexOf('.')
      //);
      // Concat puts the collection (in the URL) first
      //var collectionNames = [collectionName].concat(
      //  _.filter(['Suppliers', 'Products', 'Orders'], function(v) {
      //    return v !== collectionName;
      //  })
      //);
      var collectionNames = ['Suppliers', 'Products', 'Orders', 'Issues', 'People'];
      var defaultPageLimit = 10;

      // @return array collection of sort objects
      var getSortKeys = function(data) {

        // @TODO Default for when a schema isn't available to specify the
        // sortable attributes
        var objectWithKey = _.find(
          data,
          function(v) {
            return typeof v === 'object' && !(v instanceof Array);
          }
        );

        return objectWithKey ? _.compact(
          _.map(
            // @TODO sortable attributes will be specified in the schema
            objectWithKey,
            function(v, i) {
              return (typeof v !== 'object' && i.charAt(0) !== '$') ? i : null;
            })
        ) : [];
      };

      // The JSON of the current entity being displayed in the view
      $scope.displayTitles;
      $scope.displayTitle;
      $scope.activeData;
      $scope.schema = schema;
      $scope.formNewModels = {
        "Issues": {
          "createdAt": "",
          "Supplier_ID": "",
          "Type": "normal",
          "Subject": "",
          "StepsToComplete": [{}]
        }
      };


      // FUNCTIONS // https://docs.angularjs.org/api/ng/filter/orderBy
      //
      // For a controller handling nested objects, make the functions as
      // level-agnostic as possible (i.e. re-usable for each level) by passing
      // in data as arguments into the functions.
      //
      // ----------------------------------------------------------------------

      window._ = $scope._ = _;
      $scope.momentjs = momentjs;

      /* <input type="checkbox" id="{{ tempData.path }}" ng-model="tempData.expanded" ng-change="toggleCurrentView(tempData.expanded)" />
      $scope.toggleCurrentView = function(show) {
        if (show === false) {
          // Closing the folder
          $scope.activeData = null;

          // Have to reset the tempData
        }
      };*/

      $scope.unexpressionify = function(str) {
        return str.replace(/["-]/g, '');
      };

      // @data object the data object
      // @path object the old tempData (containing the old path property)
      // @key the string used to obtain @data from the client data
      $scope.getTempData = function(data, oldTempData, key) {

        var orderableAttributes = getSortKeys(data);
        var expressionifiedOrderBy = _.map(orderableAttributes, function(v) {
          return '"' + v + '"';
        });
        // Default is data 'object'.
        var typeOfParent = _.getByPath(oldTempData, 'typeOfThisData') ?
          oldTempData.typeOfThisData :
          'object';
        var path = oldTempData ? oldTempData.path + (
          typeOfParent === 'Array' ?
          '[' + key + ']' :
          '.' + key
        ) : 'data';
        var pathNoIndices = oldTempData ? oldTempData.pathNoIndices + (
          typeOfParent === 'Array' ?
          '[]' :
          '.' + key
        ) : 'data';

        // PSEUDOCODE:
        // Use @oldTempData.pathToKeys[@oldTempData.pathNoIndices] to obtain
        // the last @displayKeys to append to and add to @pathToKeys.

        var oldDisplayKeys = oldTempData ?
          (oldTempData.pathToKeys[oldTempData.pathNoIndices] || []) : [];
        var displayKey = $scope.schema && $scope.schema[pathNoIndices] ?
          $scope.schema[pathNoIndices].labelKey :
          key;

        var pathToKeys = _.getByPath(oldTempData, 'pathToKeys') || {};
        // Add an entry into the array regardless - can ignore on rendering
        var newDisplayKeys = oldDisplayKeys.concat(data && (typeof data[displayKey] === 'string') ? data[displayKey] : displayKey);

        //@TODO FIX THIS (wrong company showing in breadcrumbs)
        if (!pathToKeys[pathNoIndices]) {
          pathToKeys[pathNoIndices] = newDisplayKeys;
        }

        return {

          labelMap: _.getByPath($scope.schema, '["' + pathNoIndices + '"].labelMap') || [],
          path: path,
          pathNoIndices: pathNoIndices,
          // Used to inform the data type of the parent in the next iteration
          typeOfThisData: data instanceof Array ? 'Array' : typeof data,

          // orderableAttributes accepts an array of prioritised attributes.
          orderableAttributes: expressionifiedOrderBy.concat(
            _.map(expressionifiedOrderBy, function(v) {
              return '-' + v;
            })
          ),
          // Also name of the key that is displayed for folders.
          selectedSortAttr: expressionifiedOrderBy[0],
          selectedSortAttrNoQuotes: orderableAttributes[0],
          size: _.difference(
            _.keys(data), ['$$hashKey', '_selectedSortAttr', '_displayKey', '_displayKeys']
          ).length,
          expanded: false,
          limit: defaultPageLimit,

          // used so a unique variable can be used to retrieve collection data
          //parentKey: _.getByPath(oldTempData, 'thisKey'),
          //thisKey: key,

          primaryValueParent: _.getByPath(oldTempData, 'primaryValue'), // retrieve from parent
          primaryValue: data ? data[_.getByPath($scope.schema, '["' + pathNoIndices + '"].primaryKey')] : '', // record for child

          displayKey: displayKey,
          displayKeys: newDisplayKeys,
          pathToKeys: pathToKeys // for subsequent reference

        };
      };

      // @@@TODO
      // Appends to the data stored on the client session (updating filters
      // etc)
      $scope.fetchData = function(data, tempData, displayTitles) {

        // @@@@@TODO
        // 1) Obtain the URL by using the generic @pathNoIndices to retrieve
        // the '.url' and '.urlVariable' attributes from the @schema object.
        // Make sure to disable caching when using $.ajax/$http

        // The unique ID of the parent that this data can be synced as
        var primaryValueParent = _.getByPath(tempData, 'primaryValueParent');
        var pathNoIndices = _.getByPath(tempData, 'pathNoIndices');
        var schemaObject = _.getByPath(
          $scope.schema,
          '["' + pathNoIndices + '"]'
        );
        var primaryValueOfParent = _.getByPath(tempData, 'primaryValue');


        var alertifyResponseError = function(url, status, message) {
          alertify.notify('Something was wrong with the response for:\n<i class="break-word">' + url + '</i>\n\nStatus: <i class="break-word">' + status + '</i>\n\nMessage: <i class="break-word">' + message + '</i>', ' bubble-popover bubble-danger', 0);
        };

        var anyNotInstancesOf = function(list, type) {
          return _.find(list, function(v) {
            return !_.instanceOf(v, type);
          });
        };


        if (schemaObject) {

          // Retrieve properties from other objects in the data tree
          if (schemaObject.propertiesToLink) {

            _.each(schemaObject.propertiesToLink, function(toLinkObj) {

              var foreignObj;

              if (
                anyNotInstancesOf([
                  toLinkObj.path,
                  toLinkObj.propertyName,
                  toLinkObj.localKey,
                  toLinkObj.foreignKey
                ], 'string')
              ) {

                alertify.notify(
                  '@propertiesToLink configurations for <i class="break-word">"' +
                  pathNoIndices +
                  '"</i> are missing some required properties:<br><br><pre class="btn-xs break-word">' +
                  JSON.stringify(schemaObject.propertiesToLink, null, " ") +
                  '</pre>',
                  ' bubble-popover panel',
                  0
                );

              } else {

                foreignObj = _.getByPath($scope, toLinkObj.path);

                if (!data.hasOwnProperty(toLinkObj.localKey)) {
                  return;
                } else if (foreignObj instanceof Array) {

                  // If an Array, traverse the collection to get the object

                  data[toLinkObj.propertyName] =
                    _.filter(foreignObj, function(m) {
                      return m[toLinkObj.foreignKey] ===
                        data[toLinkObj.localKey];
                    }) || '';
                } else if (typeof foreignObj === 'object') {
                  data[toLinkObj.propertyName] =
                    _.getByPath(foreignObj, toLinkObj.foreignKey) || '';
                }

              }

            });
          }

          // Retrieve data via AJAX
          if (
            pathNoIndices &&
            primaryValueOfParent &&
            schemaObject.propertiesToSync instanceof Array
          ) {

            _.each(schemaObject.propertiesToSync, function(v) {

              var url;

              if (anyNotInstancesOf([
                  v.propertyName,
                  v.primaryKey,
                  v.syncWith
                ], 'string')) {

                alertify.notify(
                  '@propertiesToSync configurations for <i class="break-word">"' +
                  pathNoIndices +
                  '"</i> are missing some required properties:<br><br><pre class="btn-xs break-word">' +
                  JSON.stringify(schemaObject.propertiesToSync, null, " ") +
                  '</pre>',
                  ' bubble-popover panel',
                  0
                );

              } else {

                url = v.syncWith
                  .replace(new RegExp('{{primaryKeyParent}}', 'g'), primaryValueOfParent);


                $http.get(url, {
                    cache: false
                  })
                  .success(function(responseData, status, headersFn, config) {

                    if (status !== 200) {

                      alertifyResponseError(
                        url,
                        status,
                        'Request succeeded. Response code not 200.'
                      );

                    } else {
                      data[v.propertyName] = responseData;
                    }

                  })
                  .error(function(responseData, status, headersFn, config) {

                    if (status !== 403) {
                      alertifyResponseError(
                        url,
                        status,
                        'There was an error in the response.'
                      );
                    }

                    // Data couldn't be retrieved
                    data[v.propertyName] = v.valueIfNotFound || '';
                  })
                  .catch(function(e) {
                    if (e.message) {
                      console.log(e.message);
                    }
                  });

              }
            });

          }

        }


        // This is where the view variables are set.
        if (
          // Replace the view only if it is available.
          _.getByPath(
            $scope.schema,
            '["' + tempData.pathNoIndices + '"].viewTemplate'
          )
        ) {

          $scope.displayTitles = displayTitles;
          $scope.displayTitle = displayTitles[displayTitles.length - 1];
          $scope.activeData = data;
          $scope.currentTempData = tempData;
          $scope.viewFunctions = _.getByPath(
            $scope.schema,
            '["' + tempData.pathNoIndices + '"].viewFunctions'
          ) || '["' + tempData.pathNoIndices + '"].viewFunctions';
        }

        return data;
      };

      // Enclose the expression with '"' so keys with spaces can be used.
      // Remember this is an EXPRESSION not a variable.
      // https://github.com/angular/angular.js/issues/8592

      // @sortAttr string
      // @orderBy array
      $scope.reorderOrderBy = function(sortAttr, orderBy) {
        orderBy.unshift(orderBy.splice(orderBy.indexOf(sortAttr), 1)[0]);
        return orderBy;
      };

      $scope.whichNgtemplate = function(data, selectedSortAttr, displayKeys) {

        // This modifies the passed variable! :)
        if (selectedSortAttr) {
          data._selectedSortAttr = selectedSortAttr;
        }

        if (data && displayKeys instanceof Array) {
          data._displayKeys = displayKeys;

          if (displayKeys.length) {
            data._displayKey = displayKeys[displayKeys.length - 1];
          }
        } else if (data) {
          displayKeys = [];
        }

        return typeof data === 'object' ? 'templates/core/folder.html' : 'templates/core/element.html';
      };

      $scope.userTemplate = function(pathNoIndices, confirmOnly) {

        var path = _.getByPath(
          $scope.schema, '["' + pathNoIndices + '"].viewTemplate'
        );

        return confirmOnly ? path : (path ? 'templates/user/' + path
          // Prevent caching when testing
          //+ (window.developmentMode ? ('?t=' + new Date().getTime().toString().substring(0, 9) + '&') : '')
          //
          : null
        );
      };

      // http://jsonschema.net/
      // var dataSchema;

      $appSpinner = angular.element(document.getElementById('app-spinner'));

      $q.all(
          _.map(
            collectionNames,
            function(collectionName) {

              $appSpinner.append('<div id="id-' + collectionName + '">Loading ' + collectionName + ' ...</div>');

              return $http
                .get('data/collections/' + collectionName + '.min.json'
                  // Prevent caching when testing
                   + (window.developmentMode ? ('?t=' + new Date().getTime() + '&') : '')
                  //
                )
                .then(function(res) {

                  angular.element(
                    document.getElementById('id-' + collectionName)
                  ).addClass('text-success');

                  return res.data;
                });
            }
          )
        )
        .then(function(results) {
          window.$data = $scope.data = _.object(collectionNames, results);
          $scope.tempData = $scope.getTempData($scope.data);
        })
        .finally(function() {
          $appSpinner.removeClass('in');
          setTimeout(function() {
            $appSpinner.addClass('hide');
          }, 150);
        });

    }
  );

  // Manually bootstrap angular
  // return angular.bootstrap(document, ['tree']);
  return angularAMD.bootstrap(app);
});