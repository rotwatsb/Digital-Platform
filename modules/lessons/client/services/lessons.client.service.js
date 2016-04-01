(function () {
  'use strict';

  angular
    .module('lessons.services')
    .factory('LessonsService', LessonsService);

  LessonsService.$inject = ['$resource'];

  function LessonsService($resource) {
    return $resource('api/lessons/:lessonId', {
      lessonId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      query: {
        method: 'GET',
        params: {
          subjectArea: '@subjectArea',
          setting: '@setting',
          unit: '@unit',
          searchString: '@searchString',
          sort: '@sort',
          limit: '@limit',
          page: '@page'
        },
        isArray: true
      }
    });
  }
})();
