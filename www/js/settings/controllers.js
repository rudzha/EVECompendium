(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name SettingsCtrl
     * @description
     *
     * Constroller used by the settings view.
     * Adds Settings service to the scope.
     */
    function SettingsCtrl ($scope, Settings) {
        $scope.settings = Settings;
        /**
         * @ngdoc function
         * @name update
         * @description
         *
         * Function that is called from the Settings view, updates settings
         * every time they are changed.
         */
        $scope.setQueueRange = function (number) {
            $scope.settings.queueMeterDays = number;
            $scope.settings.save();
        };
        $scope.update = function(){
            $scope.settings.save();
        };
    }
    angular.module('compendium.settings')
        .controller('SettingsCtrl', ['$scope', 'Settings', SettingsCtrl]);
})();
