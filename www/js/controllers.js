angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
})
.controller('CharactersCtrl', function($scope) {
  $scope.characters = [
    { name: 'Reggae', id: 1 },
    { name: 'Chill', id: 2 },
    { name: 'Dubstep', id: 3 },
    { name: 'Indie', id: 4 },
    { name: 'Rap', id: 5 },
    { name: 'Cowbell', id: 6 }
  ];
})
.controller('APIKeysCtrl', function($scope, $ionicModal, APIKeyService, keys) {

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
        console.log('Adding New Key: ', $scope.newkey);
        APIKeyService.createKey($scope.newkey);
        $scope.closeAddNewAPIKey();
    };

    $scope.apikeys = keys;
    console.log(keys);
})
.controller('APIKeyCtrl', function($scope, APIKeyService, EVEAPI, key) {
    var apiKey = new EVEAPI(key.id, key.code);
    $scope.apikey = key;
    $scope.delete = function(){
        APIKeyService.deleteKey($scope.apikey.id);
    };
});
