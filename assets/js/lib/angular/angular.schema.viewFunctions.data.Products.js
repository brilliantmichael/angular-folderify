define([
  'lodash',
  'async',
  'alertify',
  'tabular-file-reader',
  'fuzzyset',
  'FileSaver.FileSaver',
  'papaparse'
], function(_, async, alertify, tabularFileReader, FuzzySet, saveAs, Papa) {

  var fuzzyset = new FuzzySet();
  var sheetNumber = 0;
  var yRegex = new RegExp(/\b\d{4}\b/g);

  return {
    // Prepare the Retailer's product data with internal property
    init: (function() {

      // This gets executed on app initialisation
      var initialised;

      return function(productData) {

        var $progressNumber =
          angular.element(document.getElementById('productsView_progressNumber'));
        var $progressText =
          angular.element(document.getElementById('productsView_progressText'));
        var $headerGroupRight = angular.element(document.getElementById('productsView_headerGroupRight'));
        var $tableOuterContainer = angular.element(document.getElementById('productsView_tableOuterContainer'));
        var $progress = angular.element(document.getElementById('productsView_progressBar'));
        var updateProgress = _.throttle(function(width, i) {

          width = width.toFixed(0) + '%';

          $progressText.html('Preparing ' + i + ' / ' + productData.length + ' products...');
          $progressNumber.html(width);
          $progress.css({
            width: width
          });
        }, 100);
        var domInitialised = function() {
          updateProgress(100, productData.length);
          $tableOuterContainer.removeClass('hide').addClass('in');
          $headerGroupRight.removeClass('hide').addClass('in');
        };

        if (!initialised) {

          async.eachSeries(productData, function(product, cb) {
            setTimeout(function() {

              var i = _.indexOf(productData, product) + 1;

              fuzzyset.add(product.title);

              updateProgress((i / productData.length) * 100, i);
              cb();

            }, 0);
          }, function() {
            domInitialised();
            initialised = true;
          });

        } else {
          $progressText.html('');
          $progressNumber.html(0);
          $progress.css({
            width: 0
          });
        }
      };
    }()),

    // @flowFiles object the FlowFile formatted object(s) containing blob(s)
    // @selectSimilarity float minimium fraction similarity out of 1
    onFileInput: function(flowFiles, selectSimilarity) {

      var $progress =
        angular.element(document.getElementById('productsView_progressBar'));
      var $progressText =
        angular.element(document.getElementById('productsView_progressText'));
      var $progressNumber =
        angular.element(document.getElementById('productsView_progressNumber'));
      var $scope =
        angular.element(
          document.getElementById('productsView_tableOuterContainer')
        ).scope();
      var $flaggedProducts;

      $progress.css({
        width: '0'
      });

      if (!$scope.data.$flaggedProducts) {
        $scope.data.$flaggedProducts = [];
      }

      $flaggedProducts = $scope.data.$flaggedProducts;

      // Delay by 2 seconds to allow progress bar to zero out
      setTimeout(function() {

        tabularFileReader(flowFiles, function(args) {

          var next = args.next;
          var ws = args.ws;
          var filename = args.filename;

          var wsLength = ws.length;
          var updateProgress = _.throttle(function(i) {

            var width = ((i / wsLength) * 100).toFixed(0);

            $progressText.html('Doing ' + i + ' / ' + wsLength + ' rows in <em>' + filename + '</em>...');
            $progressNumber.html(width + '%');
            $progress.css({
              width: width + '%'
            });
          }, 100);

          ++sheetNumber;

          if (!(ws instanceof Array) &&
            !ws.length &&
            !ws[0].title &&
            !ws[0].Title &&
            !ws[0].wholesale_cost &&
            !ws[0]['Bottle price']
          ) {
            alertify.alert('There were no rows with the headers "title", "Title", "wholesale_cost" or "Bottle price" to be found.');
            return;
          }

          // Each imported title/wholesale_cost
          async.eachSeries(ws, function(row, next) {

            setTimeout(function() {

              // Test similarity using fuzzyset on each product in collection.
              // This will contain legitimate titles to search for in the data

              var competitorTitle = row.title || row.Title;
              var fuzzyResults;
              var finished = function() {
                var rowIndex = _.indexOf(ws, row);
                updateProgress(rowIndex + 1);
                next();
              };

              if (typeof competitorTitle !== 'string') {
                return finished();
              } else {
                fuzzyResults = fuzzyset.get(competitorTitle);
              }

              if (row.wholesale_cost) {
                row.wholesale_cost = parseFloat(row.wholesale_cost);
              } else if (row['Bottle price']) {
                row.wholesale_cost = parseFloat(row['Bottle price']);
              }

              // null if none found
              if (fuzzyResults) {
                async.eachSeries(fuzzyResults, function(result, next) {

                  // Retrieve the title from the collection
                  var product = _.find($scope.data.Products, {
                    title: result[1]
                  });

                  // "If they both have years and no years match, ignore"
                  var rowVintage = competitorTitle.match(yRegex)
                  var productVintage = product.title.match(yRegex);

                  if (
                    result[0] >= selectSimilarity &&
                    product.wholesale_cost > row.wholesale_cost && (!rowVintage ||
                      !productVintage ||
                      (
                        rowVintage.length &&
                        productVintage.length &&
                        _.intersection(rowVintage, productVintage).length
                      )
                    )
                  ) {
                    // https://docs.angularjs.org/api/ng/type/ngModel.NgModelController#methods_$render
                    // "If $modelValue or $viewValue are objects (rather than a string or number) then $render() will not be invoked if you only change a property on the objects."

                    // Don't trigger rerenders here (too slow)
                    $flaggedProducts.push({

                      rowVintage: rowVintage,
                      productVintage: productVintage,

                      dm_title: product.title,
                      cm_title: competitorTitle,
                      title_similarity: result[0],
                      dm_price: product.wholesale_cost,
                      cm_price: row.wholesale_cost,
                      price_difference: row.wholesale_cost - product.wholesale_cost,
                      sheet_name: filename
                    });
                  }

                  next();
                }, function() {

                  // Add results to be displayed
                  finished();
                });
              } else {
                finished();
              }

            }, 0);
          }, function() {
            // @TODO apply dragselect to newly added elements...
            // Force a rerender here
            // http://stackoverflow.com/questions/12042422/angularjs-scope-doesnt-render-after-being-updated
            $scope.$apply(function() {});

            // Begin next file
            next();
          });

        });
      }, 2000);
    },

    removeProduct: function($flaggedProducts, criteria) {

      var whereResults = _.where($flaggedProducts, criteria);

      _.each(whereResults, function(flaggedProduct) {
        $flaggedProducts.splice(
          _.indexOf(
            $flaggedProducts,
            flaggedProduct
          ),
          1
        );
      });

    },

    exportTable: function($flaggedProducts) {

      var datestring = new Date().toISOString();
      var toExport = _.map($flaggedProducts, function(m, i) {

        var n = _.clone(m); // make sure not to destroy original data

        delete n.rowVintage;
        delete n.productVintage;

        _.each(n, function(v, k) {
          if (k.charAt(0) === '_' || k.charAt(0) === '$') {
            delete n[k];
          }
        });

        return n;
      });

      if (toExport.length) {
        saveAs(new Blob([Papa.unparse(toExport)], {
          type: 'text/csv;charset=utf-8'
        }), 'Flagged-Products_' + datestring + '.csv');
      }
    }

  };

});
