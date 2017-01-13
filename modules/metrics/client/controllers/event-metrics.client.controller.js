(function () {
  'use strict';

  angular
    .module('metrics')
    .controller('EventMetricsController', EventMetricsController);

  EventMetricsController.$inject = ['$scope', '$rootScope', '$timeout', 'moment',
  'MetricsEventService', 'MetricsEventActvityService', 'MetricsEventStatisticsService'];

  function EventMetricsController($scope, $rootScope, $timeout, moment, MetricsEventService,
    MetricsEventActvityService, MetricsEventStatisticsService) {

    $scope.getEventMetrics = function() {
      MetricsEventService.query({},
      function (data) {
        $scope.metrics = data;
        var eventTypePieLabels = [];
        if($scope.metrics.eventTypes !== undefined && $scope.metrics.eventTypes.length > 0) {
          for(var i = 0; i < $scope.metrics.eventTypes.length; i++) {
            eventTypePieLabels.push($scope.metrics.eventTypes[i].type);
          }
        }
        $scope.eventTypePieLabels = eventTypePieLabels;
        var eventTypePieData = [];
        if($scope.metrics.eventTypeCounts !== null && $scope.metrics.eventTypeCounts !== undefined) {
          for(var typeIndex = 0; typeIndex < $scope.eventTypePieLabels.length; typeIndex++) {
            var currType = $scope.eventTypePieLabels[typeIndex];
            var count = 0;
            for(var countIndex = 0; countIndex < $scope.metrics.eventTypeCounts.length; countIndex++) {
              if($scope.metrics.eventTypeCounts[countIndex].eventType === currType) {
                count = $scope.metrics.eventTypeCounts[countIndex].count;
              }
            }
            eventTypePieData.push(count);
          }
        }
        $scope.eventTypePieData = eventTypePieData;

        $scope.yearsWithEvents = $scope.metrics.yearsWithEvents;
        if($scope.yearsWithEvents !== undefined && $scope.yearsWithEvents.length > 0) {
          $scope.eventActivityFilter.year = $scope.yearsWithEvents[0];
        }
        $scope.getYearlyEventActivity();

        $scope.error = null;
        $timeout(function() {
          $rootScope.$broadcast('iso-method', { name:null, params:null });
        });
      }, function(error) {
        $scope.error = error.data.message;
      });
    };

    $scope.getMonthlyEventActivity = function() {
      var numMonthsToCount = $scope.monthHistoryLabels.length;
      MetricsEventActvityService.query({
        months: numMonthsToCount
      },
      function (eventData) {
        $scope.monthlyCountLineData.push(eventData);
      });
    };

    $scope.getYearlyEventActivity = function() {
      var startDate = moment().set({ 'year': $scope.eventActivityFilter.year, 'month': 0, 'date': 1, 'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0 });
      var endDate = moment().set({ 'year': $scope.eventActivityFilter.year, 'month': 11, 'date': 31, 'hour': 23, 'minute': 59, 'second': 59, 'millisecond': 999 });
      MetricsEventStatisticsService.query({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        sort: $scope.eventActivityFilter.activityType.value
      },
      function(data) {
        $scope.eventStatisticsData = data;
      });
    };

    $scope.eventActivityYearSelected = function(year) {
      $scope.eventActivityFilter.year = year;
      $scope.getYearlyEventActivity();
    };

    $scope.eventActivityOptionSelected = function(activity) {
      $scope.eventActivityFilter.activityType = activity;
      $scope.getYearlyEventActivity();
    };

    $scope.formatEventDate = function(date) {
      var d = new Date(date);
      return moment(d).format('MMM D, YYYY');
    };

    $scope.formatEventRegistrationDate = function(registrationDate, startDate) {
      var reg = moment(registrationDate);
      var start = moment(startDate);
      var diff = start.diff(reg, 'days');
      return diff;
    };
    //month labels on timeline line charts are
    //a rolling window of the previous 7 months + current month
    $scope.monthHistoryLabels = [];
    var labelMonthDate = moment().subtract(7, 'months');
    var nextMonth = moment().add(1, 'months').get('month');
    while(labelMonthDate.get('month') !== nextMonth) {
      $scope.monthHistoryLabels.push(labelMonthDate.format('MMMM'));
      labelMonthDate.add(1, 'months');
    }

    $scope.eventActivityOptions = [
      { name: 'by Registrants', value: 'registrants' },
      { name: 'by Attendees', value: 'attendees' },
      { name: 'by Capacity Rate', value: 'capacityRate' },
      { name: 'by Attendance Rate', value: 'attendanceRate' }
    ];

    $scope.eventActivityFilter = {
      year: moment().format('YYYY'),
      activityType: $scope.eventActivityOptions[0]
    };

    $scope.yearsWithEvents = [];
    $scope.monthlyCountLineLabels = ['Events'];
    $scope.monthlyCountLineData = [];
    $scope.getEventMetrics();
    $scope.getMonthlyEventActivity();
  }
})();
