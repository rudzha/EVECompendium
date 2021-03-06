(function() {
    'use strict';
    /**
     * @ngdoc controller
     * @name training.controllers:TrainingListCtrl
     * @description
     *
     * Controller for the Training plan list view. Lists all training plans.
     * Because of the training plan naming, plans will be grouped by character
     * name.
     */
    function TrainingListCtrl($scope, lodash, TrainingPlans) {
        $scope.trainingPlans = TrainingPlans;
        $scope.checkIfEmpty = function(object) {
            return lodash.size(object);
        };
    }
    /**
     * @ngdoc controller
     * @name training.controllers:TrainingNewCtrl
     * @description
     *
     * Controller for the new training plan creation view. Let's you select a
     * character and a skill plan to base training plan on. Automatically assigns
     * it proper name.
     */
    function TrainingNewCtrl($scope, $state, lodash, TrainingPlans, TrainingPlan, TrainingPlanGenerator, Characters, SkillsCurrentAll, SkillsQueues, skillPlans) {
        $scope.newtraining = new TrainingPlan();
        $scope.characters = Characters.list();
        $scope.skillPlans = skillPlans.list();
        $scope.updateName = function () {
            $scope.newtraining.name = '';
            var tempCharacter = Characters.read($scope.newtraining.characterID);
            if(!lodash.isUndefined(tempCharacter)){
                $scope.newtraining.name += tempCharacter.name + ' - ';
            }
            var tempSkillPlan = skillPlans.skillPlans[$scope.newtraining.planID];
            if(!lodash.isUndefined(tempSkillPlan)){
                $scope.newtraining.name += tempSkillPlan.name;
            }
        };
        $scope.saveTraining = function(){
            $scope.newtraining.generate()
            .then(function(response){
                return response.optimize();
            })
            .then(function(response){
                TrainingPlans.create(response);
            });
            $state.go('app.training.list');
        };
    }
    /**
     * @ngdoc controller
     * @name training.controllers:TrainingSelectedCtrl
     * @description
     *
     * Controller for the individual training plan view.
     */
    function TrainingSelectedCtrl($scope, $state, $stateParams, $ionicHistory, lodash, trainingPlans){
        $scope.training = trainingPlans.read($stateParams.id);
        $scope.checkIfEmpty = function(object) {
            return lodash.size(object);
        };
        $scope.delete = function(){
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            trainingPlans.delete($scope.training._id).then(function(response){
                console.log(response);
                $state.go('app.training.list');
            });
        };
    }
    angular.module('compendium.training')
        .controller('TrainingListCtrl', ['$scope', 'lodash', 'TrainingPlans', TrainingListCtrl])
        .controller('TrainingNewCtrl', ['$scope', '$state', 'lodash', 'TrainingPlans', 'TrainingPlan', 'TrainingPlanGenerator', 'Characters', 'SkillsCurrentAll', 'SkillsQueues', 'skillPlans', TrainingNewCtrl])
        .controller('TrainingSelectedCtrl', ['$scope', '$state', '$stateParams', '$ionicHistory', 'lodash', 'trainingPlans', TrainingSelectedCtrl]);
})();
