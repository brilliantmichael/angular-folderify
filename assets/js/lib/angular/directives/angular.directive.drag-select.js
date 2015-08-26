define(['lodash'], function(_) {

  //$scope.ids = [];
  // Directive to enable drag-select on table elements with id's on the td's
  // http://plnkr.co/edit/cCsLf6g83Xhg72mePoFf?p=preview

  return function($window, $document) {

    return {
      scope: {
        dragSelectIds: '=' // Makes the @var 'ids' available in the template
      },
      controller: function($scope, $element) {

        var cls = 'info';
        var startCell = null;
        var dragging = false;

        function mouseUp(el) {
          dragging = false;
        }

        function mouseDown(el) {
          dragging = true;
          setStartCell(el);
          setEndCell(el);
        }

        function mouseEnter(el) {
          if (!dragging) return;
          setEndCell(el);
        }

        function setStartCell(el) {
          startCell = el;
        }

        function setEndCell(el) {

          var cellsBetweenResult = cellsBetween(startCell, el);

          $scope.dragSelectIds = [];
          $element.find('td').removeClass(cls);

          _.each(cellsBetweenResult, function(el) {

            var jqEl = angular.element(el);
            jqEl.addClass(cls);
            $scope.dragSelectIds.push(jqEl.attr('id'));
          });
        }

        function cellsBetween(start, end) {

          var coordsStart = getCoords(start);
          var coordsEnd = getCoords(end);

          var topLeft = {
            column: $window.Math.min(coordsStart.column, coordsEnd.column),
            row: $window.Math.min(coordsStart.row, coordsEnd.row),
          };
          var bottomRight = {
            column: $window.Math.max(coordsStart.column, coordsEnd.column),
            row: $window.Math.max(coordsStart.row, coordsEnd.row),
          };

          var filtered = _.filter($element.find('td'), function(el) {

            var coords = getCoords(el);

            return coords.column >= topLeft.column && coords.column <= bottomRight.column && coords.row >= topLeft.row && coords.row <= bottomRight.row;
          });

          return angular.element(filtered);
        }

        function getCoords(cell) {
          var jqCell = angular.element(cell);
          var row = jqCell.parent();
          return {
            column: jqCell[0].cellIndex,
            row: row[0].rowIndex
          };
        }

        function wrap(fn) {
          return function() {
            var el = angular.element(this);
            $scope.$apply(function() {
              fn(el);
            });
          }
        }

        // Need to wait until after rendering is complete
        // Note these are NOT JQuery enabled elements, (JQLite) - refer to the
        // angular.element docs.
        function rebindCells() {
          setTimeout(function() {

            var $els = $element.find('td');

            $els.off('mousedown').on('mousedown', wrap(mouseDown));
            $els.off('mouseenter').on('mouseenter', wrap(mouseEnter));
          }, 0);
        }

        $document.find('body').on('mouseup', wrap(mouseUp));
        // monitor for new rows
        $element.on('mouseenter', _.throttle(rebindCells, 1000));
        rebindCells();

      }
    }
  };
});