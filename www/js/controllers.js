'use strict';
angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, EVEAPIHolder) {
    $scope.selectedCharacter = 'toast';
    $scope.instances = EVEAPIHolder.instances;
})
.controller('CharactersCtrl', function($scope) {

})
.controller('APIKeysCtrl', function($scope, $ionicModal, EVEAPIHolder, APIKeyService, keys) {
    $scope.newkey = {};
    $ionicModal.fromTemplateUrl('templates/addapikey.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.closeAddNewAPIKey = function() {
      $scope.modal.hide();
    };

    $scope.addNewAPIKey = function() {
      $scope.modal.show();
    };

    $scope.addNewKey = function() {
        APIKeyService.createKey($scope.newkey).then(function(apikeys) {
            $scope.apikeys = apikeys;
        });
        $scope.closeAddNewAPIKey();
    };
    $scope.apikeys = keys;
})
.controller('APIKeyCtrl', function($scope, $state, APIKeyService, EVEAPIHolder, key) {
    $scope.apikey = EVEAPIHolder.get(key.id);
    $scope.apikey.Account.refresh();
    $scope.delete = function(){
        APIKeyService.deleteKey($scope.apikey.keyID);
        $state.go('app.apikeys');
    };
});
