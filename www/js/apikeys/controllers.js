(function () {
    'use strict';
    /**
     * @ngdoc controller
     * @name apikeys.controllers:APIKeysListCtrl
     * @description
     *
     * Controller for the list view of all APIKeys. Binds APIKeys service to the
     * scope.
     */
    function APIKeysListCtrl($scope, APIKeys) {
        $scope.apikeys = APIKeys;
    }
    /**
     * @ngdoc controller
     * @name apikeys.controllers:APIKeysNewCtrl
     * @description
     *
     * Controller for the new APIKey additon view. Creates new APIKey object,
     * fills from user input and the passes on to APIKeys service
     */
    function APIKeysNewCtrl($scope, $state, APIKeys, APIKey, Monitor) {
        $scope.newkey = new APIKey();
        //TODO: Here for testing purposes, remove
        $scope.newkey.name = 'test';
        $scope.newkey.keyID = '4020716';
        $scope.newkey.verificationCode = 'QqV3kTFvWKLpnj51XyJKeuCFFSl4vxlsmu16u287pV8TX0M4Mf8JZHea3uudseXB';
        //
        $scope.addNewKey = function(key) {
            key.refresh().then(function(response){
                console.log('APIKeysNewCtrl', response);
                return APIKeys.create(key);
            }).then(function(response){
                Monitor.refresh();
                $state.go('app.apikeys.list');
            }).catch(function(error) {
                console.log('APIKeysNewCtrl', error);
            });
        };
    }
    /**
     * @ngdoc controller
     * @name apikeys.controllers:APIKeysSelectedCtrl
     * @description
     *
     * Controller for the individual key view.
     */
    function APIKeysSelectedCtrl($scope, $state, $stateParams, APIKeys, Monitor) {
        $scope.apikey = APIKeys.read($stateParams.id);
        $scope.deleteKey = function() {
            APIKeys.delete($stateParams.id).then(function(response){
                console.log('APIKeysSelectedCtrl', response);
                Monitor.cleanUp();
                $state.go('app.apikeys.list');
            }).catch(function(error){
                console.log('APIKeysSelectedCtrl', error);
            });
        };
    }
    angular
        .module('compendium.apikeys')
            .controller('APIKeysListCtrl', ['$scope', 'APIKeys', APIKeysListCtrl])
            .controller('APIKeysNewCtrl', ['$scope', '$state', 'APIKeys', 'APIKey', 'Monitor', APIKeysNewCtrl])
            .controller('APIKeysSelectedCtrl', ['$scope', '$state', '$stateParams', 'APIKeys', 'Monitor', APIKeysSelectedCtrl]);
})();
