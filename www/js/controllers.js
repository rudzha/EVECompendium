'use strict';
angular.module('controllers', [])
.controller('AppCtrl', function($scope, $state, Timer, settings, eve, skills) {
    Timer.start(settings.syncRate);
    $scope.eveApi = eve;
    $scope.skillTree = skills;
    console.log(skills);
    $scope.gotoApiKeys = function(){
        $state.go('app.apikeys');
    };
    $scope.refresh = function (){
        $scope.eveApi.updateCharacters()
        .then(function(response){
            return $scope.eveApi.refresh();
        })
        .then(function(response){
            console.log('TOPSCOPE:refresh', response);
        })
        .catch(function(error){
            console.log('TOPSCOPE:refresh', error);
        });
    };
})
.controller('menuCtrl', function($scope, Settings) {
    $scope.settings = Settings;
})
.controller('CharactersCtrl', function($scope, EVEAPIHolder, Settings) {
    $scope.characters = EVEAPIHolder.characters;
    console.log('Broken', Settings.selectedCharacter);
    $scope.selectedCharacter = Settings.selectedCharacter;
    $scope.select = function (char) {
        console.log(char);
        Settings.selectedCharacter = char;
        Settings.save()
        .then(function(response){
            console.log(response);
        })
        .catch(function(error){
            console.log(error);
        });
    };
})

.controller('CharacterSheetCtrl', function($scope, $stateParams) {
     $scope.characterID = $stateParams.characterID;
})
.controller('CharacterSkillsCtrl', function($scope, $sce, $ionicModal, lodash) {
    $scope.now = lodash.now();
    $scope.trustAsHtml = $sce.trustAsHtml;
    $ionicModal.fromTemplateUrl('templates/skills/skillinfo.html', {
        scope: $scope
    })
    .then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openSkillInfo = function(skillID) {
        $scope.skillInfo = $scope.skillTree.get(skillID);
        lodash.each($scope.skillInfo.requiredSkills, function(item){
            item.skillName = $scope.skillTree.get(item.skillID).skillName;
        });
        $scope.modal.show();
    };
    $scope.closeSkillInfo = function() {
        $scope.modal.hide();
    };
})
.controller('SkillsQueueCtrl', function($scope, lodash, Settings) {
    $scope.settings = Settings;
    $scope.queue = lodash.map($scope.eveApi.characters[Settings.selectedCharacter].skillQueue.queue, function(item){
        var temp = $scope.skillTree.get(item.skillID);
        return {skillID: item.skillID, name: temp.skillName, level: item.level, startTime: item.startTime, endTime: item.endTime};
    });
})
.controller('SkillsCurrentCtrl', function($scope, lodash, Settings) {
    $scope.currentSkills = lodash.map($scope.eveApi.characters[Settings.selectedCharacter].skills, function(item) {
        var temp = $scope.skillTree.get(item.skillID);
        return ({skillID: item.skillID, skill: temp.skillName, group: temp.groupName, level: item.level});
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
    $scope.newkey = {
        name: 'test',
        id: '4020716',
        code: 'QqV3kTFvWKLpnj51XyJKeuCFFSl4vxlsmu16u287pV8TX0M4Mf8JZHea3uudseXB'
    };
    $ionicModal.fromTemplateUrl('templates/apikeys/addapikey.html', {
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
        $scope.eveApi.addKey($scope.newkey).then(function(response){
            console.log('CONTROLERS:ADD_NEW_KEY', response);
            return $scope.eveApi.updateCharacters();
        }, function(error){
            console.log(error);
        })
        .then(function(response) {
            console.log(response);
            $scope.modal.hide();
        })
        .catch(function(error){
            console.log(error);
        });
    };
})
.controller('APIKeyCtrl', function($scope, $state, keyID) {
    $scope.keyID = keyID;
    $scope.delete = function(){
        $scope.eveApi.deleteKey($scope.eveApi.accounts[keyID])
        .then(function(response) {
            console.log('APIKeyCtrl:delete', response);
            $state.go('app.apikeys');
        })
        .catch(function(error) {
            console.log('APIKeyCtrl:delete', error);
        });
    };
});
