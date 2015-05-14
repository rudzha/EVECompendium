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
    function TrainingNewCtrl($scope, $state, lodash, TrainingPlans, TrainingPlan, TrainingPlanGenerator, EVEAPIHolder, skillPlans) {
        $scope.newtraining = new TrainingPlan();
        $scope.characters = EVEAPIHolder.characters;
        $scope.skillPlans = skillPlans.skillPlans;
        $scope.updateName = function () {
            $scope.newtraining.name = '';
            if(!lodash.isUndefined(EVEAPIHolder.characters[$scope.newtraining.characterID])){
                $scope.newtraining.name += EVEAPIHolder.characters[$scope.newtraining.characterID].name + ' - ';
            }
            if(!lodash.isUndefined(skillPlans.skillPlans[$scope.newtraining.planID])){
                $scope.newtraining.name += skillPlans.skillPlans[$scope.newtraining.planID].name;
            }
        };
        $scope.saveTraining = function(){
            $scope.newtraining.trainingPlan = TrainingPlanGenerator
                .generate(EVEAPIHolder.characters[$scope.newtraining.characterID].skills,
                    skillPlans.skillPlans[$scope.newtraining.planID].generatedSkillPlan);
            TrainingPlans.create($scope.newtraining);
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
    function TrainingSelectedCtrl($scope, $state, $stateParams, lodash, trainingPlans){
        $scope.training = trainingPlans.read($stateParams.id);
        $scope.checkIfEmpty = function(object) {
            return lodash.size(object);
        };
        $scope.delete = function(){
            trainingPlans.delete($scope.training._id).then(function(response){
                console.log(response);
                $state.go('app.training.list');
            });
        };
    }
    angular.module('compendium.training')
        .controller('TrainingListCtrl', ['$scope', 'lodash', 'TrainingPlans', TrainingListCtrl])
        .controller('TrainingNewCtrl', ['$scope', '$state', 'lodash', 'TrainingPlans', 'TrainingPlan', 'TrainingPlanGenerator', 'EVEAPIHolder', 'skillPlans', TrainingNewCtrl])
        .controller('TrainingSelectedCtrl', ['$scope', '$state', '$stateParams', 'lodash', 'trainingPlans', TrainingSelectedCtrl]);
})();
