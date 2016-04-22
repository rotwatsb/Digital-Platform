(function () {
  'use strict';

  angular
    .module('expeditions')
    .controller('ExpeditionProtocolsController', ExpeditionProtocolsController);

  ExpeditionProtocolsController.$inject = ['$scope', '$rootScope', '$state', '$http', 'moment', 'lodash', 'expeditionResolve',
  'Authentication', 'TeamsService', 'ProtocolMobileTrapsService', 'ProtocolOysterMeasurementsService',
  'ProtocolSettlementTilesService', 'ProtocolSiteConditionsService', 'ProtocolWaterQualityService',
  'ExpeditionsService', 'ExpeditionActivitiesService'];

  function ExpeditionProtocolsController($scope, $rootScope, $state, $http, moment, lodash, expedition,
    Authentication, TeamsService, ProtocolMobileTrapsService, ProtocolOysterMeasurementsService,
    ProtocolSettlementTilesService, ProtocolSiteConditionsService, ProtocolWaterQualityService,
    ExpeditionsService, ExpeditionActivitiesService) {
    var vm = this;
    vm.expedition = expedition;
    vm.user = Authentication.user;

    TeamsService.get({
      teamId: vm.expedition.team._id
    }, function(data) {
      vm.team = data;
    });

    vm.getExpeditionDate = function() {
      return moment(vm.expedition.monitoringStartDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MMMM D, YYYY');
    };

    var checkRole = function(role) {
      var teamLeadIndex = lodash.findIndex(vm.user.roles, function(o) {
        return o === role;
      });
      return (teamLeadIndex > -1) ? true : false;
    };

    vm.isTeamLead = checkRole('team lead');
    vm.isTeamMember = checkRole('team member');

    vm.checkWrite = function(teamList) {
      if (checkRole('team lead')) {
        return true;
      } else {
        var teamListIndex = lodash.findIndex(teamList, function(m) {
          return m.username === vm.user.username;
        });
        return (teamListIndex > -1) ? true : false;
      }
    };

    vm.setupInputValues = function(protocol, teamList) {
      if (vm.expedition.station) {
        if (!protocol.latitude && vm.expedition.station.latitude) {
          protocol.latitude = vm.expedition.station.latitude;
        }
        if (!protocol.longitude && vm.expedition.station.longitude) {
          protocol.longitude = vm.expedition.station.longitude;
        }
      }
      if (vm.expedition.monitoringStartDate) {
        if (!protocol.collectionTime) {
          protocol.collectionTime = moment(vm.expedition.monitoringStartDate).toDate();
        }
      }
      if (teamList) {
        if (!protocol.teamMembers) {
          protocol.teamMembers = [];
        }
        for (var i = 0; i < teamList.length; i++) {
          var index = lodash.indexOf(protocol.teamMembers, teamList[i]._id);
          if (index === -1) {
            protocol.teamMembers.push(teamList[i]._id);
          }
        }
        protocol.teamMembers = lodash.uniq(protocol.teamMembers);
      }
      return protocol;
    };

    vm.siteCondition = vm.setupInputValues(vm.expedition.protocols.siteCondition, vm.expedition.teamLists.siteCondition);
    vm.oysterMeasurement = vm.setupInputValues(vm.expedition.protocols.oysterMeasurement, vm.expedition.teamLists.oysterMeasurement);
    vm.mobileTrap = vm.setupInputValues(vm.expedition.protocols.mobileTrap, vm.expedition.teamLists.mobileTrap);
    vm.settlementTiles = vm.setupInputValues(vm.expedition.protocols.settlementTiles, vm.expedition.teamLists.settlementTiles);
    vm.waterQuality = vm.setupInputValues(vm.expedition.protocols.waterQuality, vm.expedition.teamLists.waterQuality);

    vm.viewSiteCondition = vm.checkWrite(vm.expedition.teamLists.siteCondition);
    vm.viewOysterMeasurement = vm.checkWrite(vm.expedition.teamLists.oysterMeasurement);
    vm.viewMobileTrap = vm.checkWrite(vm.expedition.teamLists.mobileTrap);
    vm.viewSettlementTiles = vm.checkWrite(vm.expedition.teamLists.settlementTiles);
    vm.viewWaterQuality = vm.checkWrite(vm.expedition.teamLists.waterQuality);

    vm.tabs = {
      protocol1: { isActive: false, visible: vm.viewSiteCondition, error: '' },
      protocol2: { isActive: false, visible: vm.viewOysterMeasurement, error: '' },
      protocol3: { isActive: false, visible: vm.viewMobileTrap, error: '' },
      protocol4: { isActive: false, visible: vm.viewSettlementTiles, error: '' },
      protocol5: { isActive: false, visible: vm.viewWaterQuality, error: '' }
    };

    for (var key in vm.tabs) {
      if (vm.tabs[key].visible) {
        vm.tabs[key].isActive = true;
        break;
      }
    }

    vm.checkStatusIncomplete = function() {
      var protocolsComplete = true;
      if (vm.viewSiteCondition && vm.siteCondition.status === 'incomplete') protocolsComplete = false;
      if (vm.viewOysterMeasurement && vm.oysterMeasurement.status === 'incomplete') protocolsComplete = false;
      if (vm.viewMobileTrap && vm.mobileTrap.status === 'incomplete') protocolsComplete = false;
      if (vm.viewSettlementTiles && vm.settlementTiles.status === 'incomplete') protocolsComplete = false;
      if (vm.viewWaterQuality && vm.waterQuality.status === 'incomplete') protocolsComplete = false;
      return vm.expedition.status === 'incomplete' && !protocolsComplete;
    };

    vm.checkStatusPending = function() {
      var protocolsComplete = true;
      if (vm.viewSiteCondition && vm.siteCondition.status === 'incomplete') protocolsComplete = false;
      if (vm.viewOysterMeasurement && vm.oysterMeasurement.status === 'incomplete') protocolsComplete = false;
      if (vm.viewMobileTrap && vm.mobileTrap.status === 'incomplete') protocolsComplete = false;
      if (vm.viewSettlementTiles && vm.settlementTiles.status === 'incomplete') protocolsComplete = false;
      if (vm.viewWaterQuality && vm.waterQuality.status === 'incomplete') protocolsComplete = false;
      return vm.expedition.status === 'pending' || (protocolsComplete && vm.expedition.status !== 'published');
    };

    vm.checkStatusReturned = function() {
      var protocolsComplete = true;
      if (vm.viewSiteCondition && vm.siteCondition.status === 'incomplete') protocolsComplete = false;
      if (vm.viewOysterMeasurement && vm.oysterMeasurement.status === 'incomplete') protocolsComplete = false;
      if (vm.viewMobileTrap && vm.mobileTrap.status === 'incomplete') protocolsComplete = false;
      if (vm.viewSettlementTiles && vm.settlementTiles.status === 'incomplete') protocolsComplete = false;
      if (vm.viewWaterQuality && vm.waterQuality.status === 'incomplete') protocolsComplete = false;
      return vm.expedition.status === 'returned' && !protocolsComplete;
    };

    vm.submitTeamMember = function() {
      if (vm.viewSiteCondition) $rootScope.$broadcast('saveSiteCondition');
      if (vm.viewOysterMeasurement) $rootScope.$broadcast('saveOysterMeasurement');
      if (vm.viewMobileTrap) $rootScope.$broadcast('saveMobileTrap');
      if (vm.viewSettlementTiles) $rootScope.$broadcast('saveSettlementTiles');
      if (vm.viewWaterQuality) $rootScope.$broadcast('saveWaterQuality');
    };

    var checkAllSaveSuccessful = function() {
      var allSavedSuccessfully = true;
      for (var key in vm.tabs) {
        if (vm.tabs[key].visible) {
          if (vm.tabs[key].saveSuccessful === undefined || !vm.tabs[key].saveSuccessful) {
            allSavedSuccessfully = false;
          }
        }
      }

      if (allSavedSuccessfully) {
        console.log('submitting');
        var protocols = {};
        if(vm.viewSiteCondition) protocols.siteCondition = vm.siteCondition;
        if(vm.viewOysterMeasurement) protocols.oysterMeasurement = vm.oysterMeasurement;
        if(vm.viewMobileTrap) protocols.mobileTrap = vm.mobileTrap;
        if(vm.viewSettlementTiles) protocols.settlementTiles = vm.settlementTiles;
        if(vm.viewWaterQuality) protocols.waterQuality = vm.waterQuality;

        $http.post('/api/expeditions/' + vm.expedition._id + '/submit?full=true', {
          protocols: protocols
        }).
        success(function(data, status, headers, config) {
          vm.expedition = data;
          if(vm.viewSiteCondition) vm.siteCondition.status = 'submitted';
          if(vm.viewOysterMeasurement) vm.oysterMeasurement.status = 'submitted';
          if(vm.viewMobileTrap) vm.mobileTrap.status = 'submitted';
          if(vm.viewSettlementTiles) vm.settlementTiles.status = 'submitted';
          if(vm.viewWaterQuality) vm.waterQuality.status = 'submitted';
          console.log('submitted');
        }).
        error(function(data, status, headers, config) {
          vm.error = data.message;
          console.log('error submitting');
        });
      }
    };

    vm.publish = function() {
      $http.post('/api/expeditions/' + vm.expedition._id + '/publish', {
      }).
      success(function(data, status, headers, config) {
        vm.expedition = data;
        if(vm.viewSiteCondition) vm.siteCondition.status = 'submitted';
        if(vm.viewOysterMeasurement) vm.oysterMeasurement.status = 'submitted';
        if(vm.viewMobileTrap) vm.mobileTrap.status = 'submitted';
        if(vm.viewSettlementTiles) vm.settlementTiles.status = 'submitted';
        if(vm.viewWaterQuality) vm.waterQuality.status = 'submitted';
      }).
      error(function(data, status, headers, config) {
        vm.error = data.message;
      });
    };

    vm.return = function() {
      $http.post('/api/expeditions/' + vm.expedition._id + '/return?full=true', {
      }).
      success(function(data, status, headers, config) {
        vm.expedition = data;
        vm.siteCondition = vm.expedition.protocols.siteCondition;
        vm.oysterMeasurement = vm.expedition.protocols.oysterMeasurement;
        vm.mobileTrap = vm.expedition.protocols.mobileTrap;
        vm.settlementTiles = vm.expedition.protocols.settlementTiles;
        vm.waterQuality = vm.expedition.protocols.waterQuality;

        if(vm.viewSiteCondition) vm.siteCondition.status = 'incomplete';
        if(vm.viewOysterMeasurement) vm.oysterMeasurement.status = 'incomplete';
        if(vm.viewMobileTrap) vm.mobileTrap.status = 'incomplete';
        if(vm.viewSettlementTiles) vm.settlementTiles.status = 'incomplete';
        if(vm.viewWaterQuality) vm.waterQuality.status = 'incomplete';
      }).
      error(function(data, status, headers, config) {
        vm.error = data.message;
      });
    };

    vm.unpublish = function() {
      $http.post('/api/expeditions/' + vm.expedition._id + '/unpublish', {
      }).
      success(function(data, status, headers, config) {
        vm.expedition = data;
        if(vm.viewSiteCondition) vm.siteCondition.status = 'incomplete';
        if(vm.viewOysterMeasurement) vm.oysterMeasurement.status = 'incomplete';
        if(vm.viewMobileTrap) vm.mobileTrap.status = 'incomplete';
        if(vm.viewSettlementTiles) vm.settlementTiles.status = 'incomplete';
        if(vm.viewWaterQuality) vm.waterQuality.status = 'incomplete';
      }).
      error(function(data, status, headers, config) {
        vm.error = data.message;
      });
    };

    $scope.$on('saveSiteConditionSuccessful', function() {
      vm.tabs.protocol1.saveSuccessful = true;
      console.log('successful site conditions');
      checkAllSaveSuccessful();
    });

    $scope.$on('saveOysterMeasurementSuccessful', function() {
      vm.tabs.protocol2.saveSuccessful = true;
      console.log('successful oyster measurement');
      checkAllSaveSuccessful();
    });

    $scope.$on('saveMobileTrapSuccessful', function() {
      vm.tabs.protocol3.saveSuccessful = true;
      console.log('successful mobile trap');
      checkAllSaveSuccessful();
    });

    $scope.$on('saveSettlementTilesSuccessful', function() {
      vm.tabs.protocol4.saveSuccessful = true;
      console.log('successful settlement tiles');
      checkAllSaveSuccessful();
    });

    $scope.$on('saveWaterQualitySuccessful', function() {
      vm.tabs.protocol5.saveSuccessful = true;
      console.log('successful water quality');
      checkAllSaveSuccessful();
    });

    $scope.$on('saveSiteConditionError', function() {
      vm.tabs.protocol1.saveSuccessful = false;
      console.log('error site condition');
      checkAllSaveSuccessful();
    });

    $scope.$on('saveOysterMeasurementError', function() {
      vm.tabs.protocol2.saveSuccessful = false;
      console.log('error oyster measurement');
      checkAllSaveSuccessful();
    });

    $scope.$on('saveMobileTrapError', function() {
      vm.tabs.protocol3.saveSuccessful = false;
      console.log('error mobile trap');
      checkAllSaveSuccessful();
    });

    $scope.$on('saveSettlementTilesError', function() {
      vm.tabs.protocol4.saveSuccessful = false;
      console.log('error settlement tiles');
      checkAllSaveSuccessful();
    });

    $scope.$on('saveWaterQualityError', function() {
      vm.tabs.protocol5.saveSuccessful = false;
      console.log('error water quality');
      checkAllSaveSuccessful();
    });

  }
})();