(function () {
  'use strict';

  angular
    .module('protocol-site-conditions')
    .controller('ProtocolSiteConditionsController', ProtocolSiteConditionsController);

  ProtocolSiteConditionsController.$inject = ['$scope', '$rootScope', '$state', '$http', 'moment', '$stateParams', '$timeout',
  'Authentication', 'FileUploader', 'ProtocolSiteConditionsService', 'WeatherConditionsService', 'WaterColorsService',
  'WaterFlowService', 'ShorelineTypesService', 'TeamMembersService'];

  function ProtocolSiteConditionsController($scope, $rootScope, $state, $http, moment, $stateParams, $timeout,
    Authentication, FileUploader, ProtocolSiteConditionsService, WeatherConditionsService, WaterColorsService,
    WaterFlowService, ShorelineTypesService, TeamMembersService) {
    var sc = this;

    // Set up Protocol Site Condition
    sc.protocolSiteCondition = {};
    if ($stateParams.protocolSiteConditionId) {
      ProtocolSiteConditionsService.get({
        siteConditionId: $stateParams.protocolSiteConditionId
      }, function(data) {
        sc.protocolSiteCondition = data;
        sc.waterConditionPhotoURL = (sc.protocolSiteCondition.waterConditions.waterConditionPhoto) ?
          sc.protocolSiteCondition.waterConditions.waterConditionPhoto.path : '';
        sc.landConditionPhotoURL = (sc.protocolSiteCondition.landConditions.landConditionPhoto) ?
          sc.protocolSiteCondition.landConditions.landConditionPhoto.path : '';
        sc.protocolSiteCondition.collectionTime = moment(sc.protocolSiteCondition.collectionTime).toDate();
        if (sc.protocolSiteCondition.tideConditions === undefined) {
          sc.protocolSiteCondition.tideConditions = {
            closestHighTide: moment().toDate(),
            closestLowTide: moment().toDate()
          };
        } else {
          sc.protocolSiteCondition.tideConditions.closestHighTide = (sc.protocolSiteCondition.tideConditions.closestHighTide) ?
            moment(sc.protocolSiteCondition.tideConditions.closestHighTide).toDate() : moment().toDate();
          sc.protocolSiteCondition.tideConditions.closestLowTide = (sc.protocolSiteCondition.tideConditions.closestLowTide) ?
            moment(sc.protocolSiteCondition.tideConditions.closestLowTide).toDate() : moment().toDate();
        }
      });
    } else if ($scope.protocolSiteCondition) {
      sc.protocolSiteCondition = new ProtocolSiteConditionsService($scope.protocolSiteCondition);
      sc.waterConditionPhotoURL = (sc.protocolSiteCondition.waterConditions &&
        sc.protocolSiteCondition.waterConditions.waterConditionPhoto) ?
        sc.protocolSiteCondition.waterConditions.waterConditionPhoto.path : '';
      sc.landConditionPhotoURL = (sc.protocolSiteCondition.landConditions &&
        sc.protocolSiteCondition.landConditions.landConditionPhoto) ?
        sc.protocolSiteCondition.landConditions.landConditionPhoto.path : '';
      sc.protocolSiteCondition.collectionTime = moment(sc.protocolSiteCondition.collectionTime).toDate();
      if (sc.protocolSiteCondition.tideConditions === undefined) {
        sc.protocolSiteCondition.tideConditions = {
          closestHighTide: moment().toDate(),
          closestLowTide: moment().toDate()
        };
      } else {
        sc.protocolSiteCondition.tideConditions.closestHighTide = (sc.protocolSiteCondition.tideConditions.closestHighTide) ?
          moment(sc.protocolSiteCondition.tideConditions.closestHighTide).toDate() : moment().toDate();
        sc.protocolSiteCondition.tideConditions.closestLowTide = (sc.protocolSiteCondition.tideConditions.closestLowTide) ?
          moment(sc.protocolSiteCondition.tideConditions.closestLowTide).toDate() : moment().toDate();
      }
      if (!sc.protocolSiteCondition.landConditions) {
        sc.protocolSiteCondition.landConditions = {
          shorelineSurfaceCoverEstPer: {
            imperviousSurfacePer: 0,
            perviousSurfacePer: 0,
            vegetatedSurfacePer: 0
          }
        };
      }

    } else {
      sc.protocolSiteCondition = new ProtocolSiteConditionsService();
      sc.protocolSiteCondition.landConditions = {
        shorelineSurfaceCoverEstPer: {
          imperviousSurfacePer: 0,
          perviousSurfacePer: 0,
          vegetatedSurfacePer: 0
        }
      };
      sc.waterConditionPhotoURL = '';
      sc.landConditionPhotoURL = '';
      sc.protocolSiteCondition.tideConditions = {
        closestHighTide: moment().toDate(),
        closestLowTide: moment().toDate()
      };
    }

    sc.weatherConditions = WeatherConditionsService.query();
    sc.waterColors = WaterColorsService.query();
    sc.waterFlows = WaterFlowService.query();
    sc.shorelineTypes = ShorelineTypesService.query();

    sc.authentication = Authentication;
    sc.error = null;
    sc.form = {};

    sc.teamMemberSelectConfig = {
      mode: 'tags-id',
      id: '_id',
      text: 'displayName',
      textLookup: function(id) {
        return TeamMembersService.get({ memberId: id }).$promise;
      },
      options: function(searchText) {
        return TeamMembersService.query();
      }
    };

    sc.dateTime = {
      min: moment().subtract(7, 'days').toDate(),
      max: moment().add(1, 'year').toDate()
    };

    sc.garbageExtent = [
      { label: 'None', value: 'none' },
      { label: 'Sporadic', value: 'sporadic' },
      { label: 'Common', value: 'common' },
      { label: 'Extensive', value: 'extensive' }
    ];

    sc.trueFalse = [
      { label: 'Yes', value: true },
      { label: 'No', value: false }
    ];

    sc.waterConditionUploader = new FileUploader({
      alias: 'newWaterConditionPicture',
    });

    sc.landConditionUploader = new FileUploader({
      alias: 'newLandConditionPicture',
    });

    // Remove existing protocol site condition
    sc.remove = function() {
      if (confirm('Are you sure you want to delete?')) {
        sc.protocolSiteCondition.$remove($state.go('protocol-site-conditions.main'));
      }
    };

    $scope.$on('saveSiteCondition', function() {
      sc.form.siteConditionForm.$setSubmitted(true);
      sc.save(sc.form.siteConditionForm.$valid);
    });

    // Save protocol site condition
    sc.save = function(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'sc.form.siteConditionForm');
        $rootScope.$broadcast('saveSiteConditionError');
        return false;
      }

      if (!sc.waterConditionPhotoURL || sc.waterConditionPhotoURL === '') {
        sc.error = 'Water Condition photo is required';
        $rootScope.$broadcast('saveSiteConditionError');
        return false;
      } else {
        sc.protocolSiteCondition.waterConditions.waterConditionPhoto = {
          path: sc.waterConditionPhotoURL
        };
      }

      if (!sc.landConditionPhotoURL || sc.landConditionPhotoURL === '') {
        sc.error = 'Land Condition photo is required';
        $rootScope.$broadcast('saveSiteConditionError');
        return false;
      } else {
        sc.protocolSiteCondition.landConditions.landConditionPhoto = {
          path: sc.landConditionPhotoURL
        };
      }

      if (sc.protocolSiteCondition.landConditions.shorelineSurfaceCoverEstPer.imperviousSurfacePer +
        sc.protocolSiteCondition.landConditions.shorelineSurfaceCoverEstPer.perviousSurfacePer +
        sc.protocolSiteCondition.landConditions.shorelineSurfaceCoverEstPer.vegetatedSurfacePer !== 100) {
        sc.error = 'Estimated percent surface cover should add up to 100%';
        $rootScope.$broadcast('saveSiteConditionError');
        return false;
      }

      // TODO: move create/update logic to service
      if (sc.protocolSiteCondition._id) {
        sc.protocolSiteCondition.$update(successCallback, errorCallback);
      } else {
        sc.protocolSiteCondition.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        var siteConditionId = res._id;

        function uploadWaterConditionPhoto(siteConditionId, waterPhotoSuccessCallback, waterPhotoErrorCallback) {
          if (sc.waterConditionUploader.queue.length > 0) {
            sc.waterConditionUploader.onSuccessItem = function (fileItem, response, status, headers) {
              waterPhotoSuccessCallback();
            };

            sc.waterConditionUploader.onErrorItem = function (fileItem, response, status, headers) {
              waterPhotoErrorCallback(response.message);
            };

            sc.waterConditionUploader.onBeforeUploadItem = function(item) {
              item.url = 'api/protocol-site-conditions/' + siteConditionId + '/upload-water-condition';
            };
            sc.waterConditionUploader.uploadAll();
          } else {
            waterPhotoSuccessCallback();
          }
        }

        function uploadLandConditionPhoto(siteConditionId, landPhotoSuccessCallback, landPhotoErrorCallback) {
          if (sc.landConditionUploader.queue.length > 0) {
            sc.landConditionUploader.onSuccessItem = function (fileItem, response, status, headers) {
              landPhotoSuccessCallback();
            };

            sc.landConditionUploader.onErrorItem = function (fileItem, response, status, headers) {
              landPhotoErrorCallback(response.message);
            };

            sc.landConditionUploader.onBeforeUploadItem = function(item) {
              item.url = 'api/protocol-site-conditions/' + siteConditionId + '/upload-land-condition';
            };
            sc.landConditionUploader.uploadAll();
          } else {
            landPhotoSuccessCallback();
          }
        }

        uploadWaterConditionPhoto(siteConditionId, function() {
          uploadLandConditionPhoto(siteConditionId, function() {
            $rootScope.$broadcast('saveSiteConditionSuccessful');
          }, function(errorMessage) {
            delete sc.protocolSiteCondition._id;
            sc.error = errorMessage;
            $rootScope.$broadcast('saveSiteConditionError');
            return false;
          });
        }, function(errorMessage) {
          delete sc.protocolSiteCondition._id;
          sc.error = errorMessage;
          $rootScope.$broadcast('saveSiteConditionError');
          return false;
        });

      }

      function errorCallback(res) {
        sc.error = res.data.message;
        $rootScope.$broadcast('saveSiteConditionError');
      }
    };

    sc.cancel = function() {
      $state.go('protocol-site-conditions.main');
    };

    $scope.$on('incrementalSaveSiteCondition', function() {
      sc.saveOnBlur();
    });

    sc.saveOnBlur = function() {
      if (sc.protocolSiteCondition._id) {
        $http.post('/api/protocol-site-conditions/' + sc.protocolSiteCondition._id + '/incremental-save',
        sc.protocolSiteCondition)
        .success(function (data, status, headers, config) {
          sc.protocolSiteCondition = new ProtocolSiteConditionsService(data.siteCondition);
          sc.waterConditionPhotoURL = (sc.protocolSiteCondition.waterConditions.waterConditionPhoto) ?
            sc.protocolSiteCondition.waterConditions.waterConditionPhoto.path : '';
          sc.landConditionPhotoURL = (sc.protocolSiteCondition.landConditions.landConditionPhoto) ?
            sc.protocolSiteCondition.landConditions.landConditionPhoto.path : '';
          sc.protocolSiteCondition.collectionTime = moment(sc.protocolSiteCondition.collectionTime).toDate();
          sc.protocolSiteCondition.tideConditions.closestHighTide =
            moment(sc.protocolSiteCondition.tideConditions.closestHighTide).toDate();
          sc.protocolSiteCondition.tideConditions.closestLowTide =
            moment(sc.protocolSiteCondition.tideConditions.closestLowTide).toDate();
          if (data.errors) {
            sc.error = data.errors;
            $rootScope.$broadcast('incrementalSaveSiteConditionError');
          }
          if (data.successful) {
            sc.error = null;
            $rootScope.$broadcast('incrementalSaveSiteConditionSuccessful');
          }
        })
        .error(function (data, status, headers, config) {
          sc.error = data.message;
          $rootScope.$broadcast('incrementalSaveSiteConditionError');
        });
      }
    };

    $scope.$watch('sc.waterConditionPhotoURL', function(newValue, oldValue) {
      if (sc.protocolSiteCondition._id && sc.waterConditionPhotoURL !== '') {
        if (sc.waterConditionUploader.queue.length > 0) {
          sc.waterConditionUploader.onSuccessItem = function (fileItem, response, status, headers) {
            sc.waterConditionUploader.removeFromQueue(fileItem);
            ProtocolSiteConditionsService.get({
              siteConditionId: sc.protocolSiteCondition._id
            }, function(data) {
              sc.protocolSiteCondition = data;
              sc.waterConditionPhotoURL = (sc.protocolSiteCondition.waterConditions.waterConditionPhoto) ?
                sc.protocolSiteCondition.waterConditions.waterConditionPhoto.path : '';
              sc.landConditionPhotoURL = (sc.protocolSiteCondition.landConditions.landConditionPhoto) ?
                sc.protocolSiteCondition.landConditions.landConditionPhoto.path : '';
              sc.protocolSiteCondition.collectionTime = moment(sc.protocolSiteCondition.collectionTime).toDate();
              sc.protocolSiteCondition.tideConditions.closestHighTide = moment(sc.protocolSiteCondition.tideConditions.closestHighTide).toDate();
              sc.protocolSiteCondition.tideConditions.closestLowTide = moment(sc.protocolSiteCondition.tideConditions.closestLowTide).toDate();
            });
          };

          sc.waterConditionUploader.onErrorItem = function (fileItem, response, status, headers) {
            sc.error = response.message;
          };

          sc.waterConditionUploader.onBeforeUploadItem = function(item) {
            item.url = 'api/protocol-site-conditions/' + sc.protocolSiteCondition._id + '/upload-water-condition';
          };
          sc.waterConditionUploader.uploadAll();
        }
      } else if (sc.protocolSiteCondition._id && sc.waterConditionPhotoURL === '') {
        sc.protocolSiteCondition.waterConditions.waterConditionPhoto.path = '';
        sc.saveOnBlur();
      }
    });

    $scope.$watch('sc.landConditionPhotoURL', function(newValue, oldValue) {
      if (sc.protocolSiteCondition._id && sc.landConditionPhotoURL !== '') {
        if (sc.landConditionUploader.queue.length > 0) {
          sc.landConditionUploader.onSuccessItem = function (fileItem, response, status, headers) {
            sc.landConditionUploader.removeFromQueue(fileItem);
            ProtocolSiteConditionsService.get({
              siteConditionId: sc.protocolSiteCondition._id
            }, function(data) {
              sc.protocolSiteCondition = data;
              sc.waterConditionPhotoURL = (sc.protocolSiteCondition.waterConditions.waterConditionPhoto) ?
                sc.protocolSiteCondition.waterConditions.waterConditionPhoto.path : '';
              sc.landConditionPhotoURL = (sc.protocolSiteCondition.landConditions.landConditionPhoto) ?
                sc.protocolSiteCondition.landConditions.landConditionPhoto.path : '';
              sc.protocolSiteCondition.collectionTime = moment(sc.protocolSiteCondition.collectionTime).toDate();
              sc.protocolSiteCondition.tideConditions.closestHighTide = moment(sc.protocolSiteCondition.tideConditions.closestHighTide).toDate();
              sc.protocolSiteCondition.tideConditions.closestLowTide = moment(sc.protocolSiteCondition.tideConditions.closestLowTide).toDate();
            });
          };

          sc.landConditionUploader.onErrorItem = function (fileItem, response, status, headers) {
            sc.error = response.message;
          };

          sc.landConditionUploader.onBeforeUploadItem = function(item) {
            item.url = 'api/protocol-site-conditions/' + sc.protocolSiteCondition._id + '/upload-land-condition';
          };
          sc.landConditionUploader.uploadAll();
        }
      } else if (sc.protocolSiteCondition._id && sc.landConditionPhotoURL === '') {
        sc.protocolSiteCondition.landConditions.landConditionPhoto.path = '';
        sc.saveOnBlur();
      }
    });

    $timeout(function() {
      sc.saveOnBlur();
    });

    sc.openMap = function() {
      $rootScope.$broadcast('stopSaving');
    };

    sc.closeMap = function() {
      $rootScope.$broadcast('startSaving');
    };
  }
})();
