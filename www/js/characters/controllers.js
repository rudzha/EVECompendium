(function () {
    'use strict';
    /**
     * @ngdoc controller
     * @name characters.controllers:CharactersCtrl
     * @description
     *
     * Controller for the Characters view, lists all characters and let's user
     * select the character to work with
     */
    function CharactersCtrl($scope, Settings, Characters) {
        $scope.characters = Characters;
        $scope.selectedCharacter = Settings.selectedCharacter;
        $scope.selectCharacter = function(characterID) {
            Settings.selectedCharacter = characterID;
            Settings.save()
            .then(function(response){
                console.log(response);
            })
            .catch(function(error){
                console.log(error);
            });
        };
    }
    /**
     * @ngdoc controller
     * @name characters.controllers:CharacterSheetCtrl
     * @description
     *
     * Controller for the Character sheet view, displays character information
     */
    function CharacterSheetCtrl($scope, $stateParams, Characters) {
        $scope.character = Characters.read($stateParams.id);
    }
    /**
     * @ngdoc controller
     * @name characters.controllers:CharacterSkillsCtrl
     * @description
     *
     * Controller for the abstract Skills view, provides tabs and skill description
     * modal
     */
    function CharacterSkillsCtrl($scope, $sce, $ionicModal, lodash, SkillTree, Settings) {
        $scope.now = lodash.now();
        $scope.settings = Settings;
        console.log($scope.settings.selectedCharacter);
        $scope.trustAsHtml = $sce.trustAsHtml;
        $ionicModal.fromTemplateUrl('templates/skills/skillinfo.html', {
            scope: $scope
        })
        .then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openSkillInfo = function(skillID) {
            $scope.skillInfo = SkillTree.read(skillID);
            lodash.each($scope.skillInfo.requiredSkills, function(item){
                item.skillName = SkillTree.read(item.skillID).skillName;
            });
            $scope.modal.show();
        };
        $scope.closeSkillInfo = function() {
            $scope.modal.hide();
        };
    }
    /**
     * @ngdoc controller
     * @name characters.controllers:SkillsCurrentCtrl
     * @description
     *
     * Controller Skills/Current view, displays selected character's current
     * skills
     */
    function SkillsCurrentCtrl($scope, $stateParams, SkillsCurrentAll) {
        $scope.currentSkills = SkillsCurrentAll.read($stateParams.id);
    }
    /**
     * @ngdoc controller
     * @name characters.controllers:SkillsAllCtrl
     * @description
     *
     * Controller Skills/All view, displays all available skills in game
     */
    function SkillsAllCtrl ($scope, SkillTree) {
        $scope.skilltree = SkillTree.list();
    }
    /**
     * @ngdoc controller
     * @name characters.controllers:SkillsQueueCtrl
     * @description
     *
     * Controller Skills/Queue view, displays character's current, ingame skill
     * queue
     */
    function SkillsQueueCtrl ($scope, $stateParams, SkillsQueues) {
        $scope.queue = SkillsQueues.read($stateParams.id);
    }
    function MailListCtrl ($scope, $stateParams, $sce, $ionicModal, EVEMailboxes) {
        $scope.mailList = EVEMailboxes.read($stateParams.id);
        $ionicModal.fromTemplateUrl('templates/mail/mailmessage.html', {
            scope: $scope
        })
        .then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openMessage = function(header) {
            $scope.message = $scope.mailList.mailbody[header.messageID];
            $scope.title = header.title;
            $scope.senderName = header.senderName;
            $scope.sentDate = header.sentDate;
            $scope.trustAsHtml = $sce.trustAsHtml;
            header.read = true;
            EVEMailboxes.update($scope.mailList)
            .then(function(){
                $scope.modal.show();
            }).catch(function(error) {
                console.log(error);
            });

        };
        $scope.closeMessage = function() {
            $scope.modal.hide();
        };
    }
    angular
        .module('compendium.characters')
            .controller('CharactersCtrl', ['$scope', 'Settings', 'Characters', CharactersCtrl])
            .controller('CharacterSheetCtrl', ['$scope', '$stateParams', 'Characters', CharacterSheetCtrl])
            .controller('CharacterSkillsCtrl', ['$scope', '$sce', '$ionicModal', 'lodash', 'SkillTree', 'Settings', CharacterSkillsCtrl])
            .controller('SkillsAllCtrl', ['$scope', 'SkillTree', SkillsAllCtrl])
            .controller('SkillsQueueCtrl', ['$scope', '$stateParams', 'SkillsQueues', SkillsQueueCtrl])
            .controller('SkillsCurrentCtrl', ['$scope', '$stateParams', 'SkillsCurrentAll', SkillsCurrentCtrl])
            .controller('MailListCtrl', ['$scope', '$stateParams', '$sce', '$ionicModal', 'EVEMailboxes', MailListCtrl]);
})();
