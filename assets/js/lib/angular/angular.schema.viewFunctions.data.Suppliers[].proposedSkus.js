define([
  'lodash',
  'async',
  'alertify',
  'tabular-file-reader',
  'FileSaver.FileSaver',
  'papaparse'
], function(_, async, alertify, tabularFileReader, saveAs, Papa) {

  return {

    // @dragSelectIds array
    toggleCheck: function(dragSelectIds, products, onOrOff) {

      var dateString = new Date().toLocaleDateString();

      _.each(_.compact(dragSelectIds), function(dragSelectId) {

        var splits = dragSelectId.split(':');
        var product;

        if (splits.length === 3) {

          product = _.find(products, function(product) {
            return product.title === splits[1];
          });

          if (typeof product.progress !== 'object') {
            product.progress = {};
          }

          // This sets the data! :)
          product.progress[splits[2]] = onOrOff ? dateString : false;
        }

      });
    },

    // @activeData object the data of the view scope
    save: function(activeData, primaryValueParent, tableId) {

      var url =
        '//danmurphys-marketplace.s3.amazonaws.com/form-data/data.Suppliers[].proposedSkus/data.Suppliers[].proposedSkus.' +
        primaryValueParent +
        '.json';
      var $http = angular.element(document.body).injector().get('$http');
      var toSave = _.filter(activeData, function(product, i) {

        product = _.omit(product, function(value, key) {

          return key.toString().charAt(0) === '_' ||
            key.toString().charAt(0) === '$';
        });

        // Omit the internal keys when saving to JSON
        return _.keys(product).length;
      });

      $http.put(url, toSave)
        .success(function(status, headersFn, config) {
          alertify.notify('Saved', ' bubble-popover bubble-success');
          angular.element(document.getElementById(tableId)).find('td').removeClass('info');
        })
        .error(function(responseData, status, headersFn, config) {
          if (status !== 403) {
            alertifyResponseError(
              url,
              status,
              'There was an error in the response.'
            );
          }
        })
        .catch(function(e) {
          if (e.message) {
            console.log(e.message);
          }
        });

    },

    removeProduct: function(activeData, title) {

      return _.find(activeData, function(m, i) {

        if (m && m.title === title) {
          return activeData.splice(i, 1);
        } else {
          return false;
        }
      });
    },

    // @flowFiles array the array of files
    onFileInput: function(flowFiles, activeData) {

      tabularFileReader(flowFiles, function(args) {

        var ws = args.ws;
        var READER = args.READER;
        var next = args.next;
        var filename = args.filename;

        var dateString = new Date().toLocaleDateString();
        var $scope =
          angular.element(
            document.getElementById('table_data.Suppliers[].proposedSkus')
          ).scope();

        async.eachSeries(ws, function(m, next) {

          setTimeout(function() {

            var productName = typeof m === 'object' ? m['Product Name'] : null;
            var currentNames = _.pluck(activeData, 'title');
            var newProduct;

            if (productName && _.indexOf(currentNames, productName) === -1) {

              newProduct = {};
              newProduct.dateAdded = dateString;
              newProduct.title = productName;
              newProduct.progress = {};

              activeData.push(newProduct);
            }

            next();

          }, 0);

        }, function() {
          // Force render of new titles
          $scope.$apply(function() {});
        });

      });
    },

    exportTable: function(activeData) {

      var datestring = new Date().toISOString();
      var toExport = _.map(activeData, function(m, i) {

        var n = _.clone(m); // make sure not to destroy original data

        _.each(n, function(v, k) {
          if (k.charAt(0) === '_' || k.charAt(0) === '$') {
            delete n[k];
          }
        });

        _.each(n.progress, function(v, k) {
          n[k] = v;
        });

        delete n.progress;

        return n;
      });


      if (toExport.length) {
        saveAs(new Blob([Papa.unparse(toExport)], {
          type: 'text/csv;charset=utf-8'
        }), 'Proposed-SKUs_' + datestring + '.csv');
      }
    }

  };

});