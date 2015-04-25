'use strict';
angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, EVEAPIHolder, UserService, SkillTreeService) {
    $scope.user = UserService;
    $scope.eveApi = EVEAPIHolder;
    $scope.gotoApiKeys = function(){
        $state.go('app.apikeys');
    };
    $scope.refresh = function (){
        EVEAPIHolder.checkForNewCharacters().then(function(){
            return EVEAPIHolder.refresh();
        }).then(function(){
            EVEAPIHolder.save();
        });
    };
})
.controller('menuCtrl', function($scope, $state) {

})
.controller('CharactersCtrl', function($scope, $state) {

})
.controller('CharacterSheetCtrl', function($scope, $state, characterID) {
    $scope.characterID = characterID;
})
.controller('CharacterSkillsCtrl', function($scope, $state, lodash, EVEAPIHolder, SkillTreeService, characterID, skills) {
    $scope.characterID = characterID;
    console.log(characterID, skills);
    $scope.currentSkills = lodash.map($scope.eveApi.characters[characterID].skills, function(item) {
        var temp = SkillTreeService.get(item.skillID);
        return ({skill: temp.skillName, group: temp.groupName, level: item.level});
    });
    $scope.allSkills = SkillTreeService.getSkillTree();
    $scope.allSkills = lodash.transform($scope.allSkills, function(result, item){
        result.push(item);
        return result;
    },[]);
})
.controller('APIKeysCtrl', function($scope, $ionicModal, EVEAPIHolder) {
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
        console.log($scope.newkey);
        EVEAPIHolder.add($scope.newkey).then(function(){
            return EVEAPIHolder.checkForNewCharacters();
        }).then(function() {
            return EVEAPIHolder.refresh();
        }).then(function() {
            return EVEAPIHolder.save();
        }, function(err){
            EVEAPIHolder.save();
            return err;
        }).then(function(){
            console.log($scope.eveApi);
            $scope.closeAddNewAPIKey();
        }).catch(function(err){
            console.log('AddAPIKey', err);
            $scope.closeAddNewAPIKey();
        });
    };
})
.controller('APIKeyCtrl', function($scope, $state, EVEAPIHolder, keyID) {
    $scope.keyID = keyID;
    $scope.delete = function(){
        EVEAPIHolder.delete(keyID).then(function() {
            return EVEAPIHolder.save();
        }).then(function(){
            $state.go('app.apikeys');
        });
    };
})
.controller('SettingsCtrl', function($scope, UserService) {
    $scope.settings = UserService;
});
