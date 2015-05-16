'use strict';
angular.module('controllers', [])
.controller('AppCtrl', function($scope, $state, Monitor, Timer, settings) {
    Timer.start(settings.syncRate);
    $scope.refresh = function (){
        Monitor.refresh();
    };
})
.controller('menuCtrl', function($scope, Settings, Characters) {
    $scope.settings = Settings;
    $scope.characters = Characters;
});
