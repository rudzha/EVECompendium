'use strict';
angular.module('compendium.controllers', [])
.controller('AppCtrl', function($scope, $state, user, eve, skills) {
    $scope.userService = user;
    $scope.eveApi = eve;
    $scope.skillTree = skills;
    console.log(skills);
    $scope.gotoApiKeys = function(){
        $state.go('app.apikeys');
    };
    $scope.refresh = function (){
        $scope.eveApi.updateCharacters().then(function(){
            return $scope.eveApi.refresh();
        }).then(function(){
            $scope.eveApi.save();
        });
    };
})
.controller('menuCtrl', function() {})
.controller('CharactersCtrl', function() {})
.controller('CharacterSheetCtrl', function($scope, characterID) {
     $scope.characterID = characterID;
})
.controller('CharacterSkillsCtrl', function() {})
.controller('SkillsQueueCtrl', function($scope, lodash) {
    $scope.queue = lodash.map($scope.eveApi.characters[$scope.userService.selectedCharacter].skillQueue.queue, function(item){
        var temp = $scope.skillTree.get(item.skillID);
        return {name: temp.skillName, level: item.level, endTime: item.endTime};
    });
})
.controller('SkillsCurrentCtrl', function($scope, lodash) {
    $scope.currentSkills = lodash.map($scope.eveApi.characters[$scope.userService.selectedCharacter].skills, function(item) {
        var temp = $scope.skillTree.get(item.skillID);
        return ({skill: temp.skillName, group: temp.groupName, level: item.level});
    });
})
.controller('SkillsAllCtrl', function($scope, lodash) {
    $scope.allSkills = lodash.transform($scope.skillTree.skillTree, function(result, item) {
        result.push(item);
        return result;
    },[]);
})
.controller('APIKeysCtrl', function($scope, $ionicModal) {
    //TODO: remove, here for testing purposes
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
        $scope.eveApi.addKey($scope.newkey).then(function(response){
            console.log('CONTROLERS:ADD_NEW_KEY', response);
            return $scope.eveApi.updateCharacters();
        }, function(error){
            console.log(error);
        }).then(function(response){
            return $scope.eveApi.save();
        }, function(error){
            console.log(error);
        }).then(function(response){
            $scope.closeAddNewAPIKey();
        });
    };
})
.controller('APIKeyCtrl', function($scope, $state, keyID) {
    $scope.keyID = keyID;
    $scope.delete = function(){
        $scope.eveApi.delete(keyID).then(function() {
            return $scope.eveApi.save();
        }).then(function(){
            $state.go('app.apikeys');
        });
    };
})
.controller('SettingsCtrl', function() {});
