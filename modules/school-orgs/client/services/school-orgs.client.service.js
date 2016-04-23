(function () {
  'use strict';

  angular
    .module('school-orgs.services')
    .factory('SchoolOrganizationsService', SchoolOrganizationsService);

  SchoolOrganizationsService.$inject = ['$resource'];

  function SchoolOrganizationsService($resource) {
    return $resource('api/school-orgs/:schoolOrgId', {
      schoolOrgId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      query: {
        method: 'GET',
        params: {
          pending: '@pending',
          searchString: '@searchString',
          showTeams: '@showTeams',
          sort: '@sort',
          limit: '@limit',
          page: '@page'
        },
        isArray: true
      }
    });
  }
})();
