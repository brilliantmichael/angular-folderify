define([
  'lodash',
  'async',
  'alertify',
  'masonry'
], function(_, async, alertify, Masonry) {

  var msnry;
  var applyMasonry = function() {

    if (msnry instanceof Masonry) {
      msnry.destroy();
    }

    msnry = new Masonry(
      document.getElementById('issuesViewContainer'), {
        itemSelector: '.issuesView-masonry'
      });

    setTimeout(function() {

      var itemElements;

      msnry.reloadItems();
      itemElements = msnry.getItemElements();
      msnry.layout();

    }, 0);
  };

  return {
    selectValue: function(firstname, lastname, company) {
      // ("{\"firstname\":\"" + person.firstname + "\",\"lastname:\"" + person.lastname + "\",\"Company\":\"" + person.Company + "\"}")
      return JSON.stringify({
        firstname: firstname,
        lastname: lastname,
        Company: company
      });
    },
    selectLabel: function(firstname, lastname, company) {
      return firstname + ' ' + (lastname ? lastname + ' ' : '') + '(' + company + ')';
    },
    addStep: function(stepsToComplete) {
      stepsToComplete.push({});
      applyMasonry();
    },
    formSubmit: function(model, collection, $event) {

      //var $http = angular.element(document.body).injector().get('$http');

      model.createdAt = new Date().toISOString();

      // @TODO abstract validation
      if (!model.Subject ||
        !model.Supplier_ID ||
        _.indexOf(['normal', 'warning', 'critical'], model.Type) === -1 ||
        !(model.StepsToComplete instanceof Array &&
          model.StepsToComplete.length)
      ) {
        return alertify.notify(
          '<div class="arrow"></div>Invalid issue values submitted.',
          ' bubble-popover bubble-danger left',
          0
        );
      }

      /*$http.put(url, toSave)
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
        });*/

      // @TODO abstract ajax using $resource

      collection.unshift(model);

      alertify.notify(
        '<div class="arrow"></div>Issue created.',
        ' bubble-popover bubble-success'
      );

      applyMasonry();

      return {
        "createdAt": "",
        "Supplier_ID": "",
        "Type": "normal",
        "Subject": "",
        "StepsToComplete": [{}]
      }; // empty the form
    },
    applyMasonry: applyMasonry
  };
});
