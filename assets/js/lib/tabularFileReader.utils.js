define([
  'lodash',
  'async',
  'alertify',
  'SheetJS.xlsx',
  'SheetJS.xls',
  'papaparse'
], function(
  _,
  async,
  alertify,
  XLSX,
  XLS,
  Papa
) {

  var reader = new FileReader(); // filereader is async - must wait iterations

  function readFlowFiles($flow, callback) {

    var fileQueue = $flow.files;
    var filenames;
    var startTime = new Date().getTime();

    if (!(fileQueue instanceof Array)) {
      fileQueue = [fileQueue];
    }

    if (fileQueue.length > 0) { // if we still have files left

      filenames = _.pluck(fileQueue, 'name');

      async.eachSeries(fileQueue, function(file, next) {

        //var file = fileQueue.shift(); // remove first from queue and store in file
        var filename = file.name;

        file = file.file; // get blob from flowfile

        reader.onloadend = function(e) {

          var data = e.target.result; // binary
          var headers;
          var READER = XLSX;; // XLSX/XLS keep variable generic for reuse
          var wb;
          var ws;
          var errorMsg = 'Not a readable <em>.xlsx</em> file. Please make sure your workbook is saved as an <em>Excel</em> file with a single template worksheet.';
          var processSheet = function(wb) {
            // Good to go
            ws = wb.Sheets[_.keys(wb.Sheets)[0]];
            delete wb; // free up memory

            // Trim the headers
            if (typeof _.getByPath(ws, 'A1.v') === 'string') {
              ws.A1.v = ws.A1.v.trim();
            }
            if (typeof _.getByPath(ws, 'A1.w') === 'string') {
              ws.A1.w = ws.A1.w.trim();
            }

            return READER.utils.sheet_to_json(ws);
          };

          try {
            wb = READER.read(data, {
              type: 'binary'
            });
            ws = processSheet(wb);
          } catch (exception) {
            // XLSX doesn't throw a very informative exception
            try {
              READER = XLS;
              wb = READER.read(data, {
                type: 'binary'
              });
              ws = processSheet(wb);
            } catch (exception) {

              errorMsg =
                typeof exception === 'string' ? exception : exception.message;

              try {

                data = Papa.parse(data);
                headers = data.data.shift();

                if (!data.errors.length) {

                  // @TODO should we async this for large files?...
                  ws = _.map(data.data, function(row) {
                    return _.object(headers, row);
                  });

                } else {
                  throw new Error('Errors parsing CSV string.');
                }
              } catch (exception) {

                errorMsg =
                  typeof exception === 'string' ? exception : exception.message;
              }
            }
          }

          if (!ws) {
            alertify.notify(
              errorMsg,
              ' bubble-popover bubble-danger',
              0
            );
            return; // cancel the operation
          }

          if (typeof callback !== 'undefined') {

            // args
            callback({
              ws: ws,
              filename: filename,
              READER: READER,
              next: next
            });

          } else {
            next();
          }

          // readFlowFiles(callback); // start next file
        };

        reader.readAsBinaryString(file);

      }, function() {

        $flow.cancel();

        alertify.alert(
          '<ul><h5>Finished processing the following files:</h5><li>'
            + filenames.join('</li><li>')
            + '</li></ul>'
        );

      });
    }
  };

  return function($flow, callback) {
    readFlowFiles($flow, callback);
  };

});
