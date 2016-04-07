(function() {
  'use strict';

  angular
    .module('forms')
    .directive('selectTags', function() {
      return {
        restrict: 'AE',
        templateUrl: 'modules/forms/client/views/select-tags.client.view.html',
        scope: {
          outModel: '=ngModel',
          inTitle: '@',
          outerColumn: '@',
          name: '@',
          required: '@',
          labelClass: '@',
          selectConfig: '='
        },
        require: ['ngModel','selectConfig'],
        replace: true
      };
    });
})();
