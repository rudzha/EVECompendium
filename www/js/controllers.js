(function(){
    'use strict';
    function AppCtrl ($scope, $state, Monitor, Timer, settings) {
        Timer.start(settings.syncRate);
        Timer.registerFunction(Monitor.refresh);
        $scope.refresh = function (){
            Monitor.refresh();
        };
    }
    function menuCtrl ($scope, Settings, Characters) {
        $scope.settings = Settings;
        $scope.characters = Characters;
    }
    angular
        .module('controllers', [])
            .controller('AppCtrl', ['$scope', '$state', 'Monitor', 'Timer', 'settings', AppCtrl])
            .controller('menuCtrl', ['$scope', 'Settings', 'Characters', menuCtrl]);
})();
