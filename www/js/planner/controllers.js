(function(){
    'use strict';
    /**
     * @ngdoc controller
     * @name plan.controllers:PlansCtrl
     * @description
     *
     * Controller for the main Skill Plans view,
     * adds SkillPlans holder to the scope;
     */
    function PlansCtrl ($scope, lodash, skillPlans) {
            $scope.skillPlans = skillPlans;
            $scope.checkIfEmpty = function(object) {
                return lodash.size(object);
            };
    }

    /**
     * @ngdoc controller
     * @name plan.controllers:PlansEditorCtrl
     * @description
     *
     * Controller for the plan editor, used to edit an already existing or a new
     * skill plan.
     * Opens a modal for adding new skill.
     * Adds array of numbers to scope to get a number from the select/option dialog
     */
    function PlansEditorCtrl ($scope, $state, $stateParams, $ionicHistory, $ionicModal, SkillPlanGenerator, lodash, skillPlans) {
        $scope.showReorder = false;
        $scope.showDelete = false;
        $scope.levels = [1,2,3,4,5];
        if($stateParams.id) {
            console.log('Edit');
            $scope.plan = skillPlans.read($stateParams.id);
            $scope.edit = true;
        } else {
            console.log('New');
            $scope.edit = false;
            $scope.plan = {
                name: '',
                skillSeed: []
            };
        }
        $scope.allSkills = lodash.transform($scope.skillTree.skillTree, function(result, item) {
            result.push(item);
            return result;
        },[]);
        $ionicModal.fromTemplateUrl('templates/planner/addskill.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.addSkill = function() {
          $scope.modal.show();
        };
        $scope.AddSkillToSeed = function(id) {
            if(!lodash.findWhere($scope.plan.skillSeed, {skillID: id})){
                var temp = $scope.skillTree.get(id);
                temp = {name: temp.skillName, skillID: temp.skillID, level: 1, requiredSkills: temp.requiredSkills, requiredAttributes: temp.requiredAttributes};
                $scope.plan.skillSeed.push(temp);
            }
            $scope.modal.hide();
        };
        $scope.reorderSkill = function (skill, fromIndex, toIndex) {
            $scope.plan.skillSeed.splice(fromIndex, 1);
            $scope.plan.skillSeed.splice(toIndex, 0, skill);
        };
        $scope.removeSkill = function(index) {
            $scope.plan.skillSeed.splice(index, 1);
        };
        $scope.closeAddSkill = function() {
            $scope.modal.hide();
        };
        $scope.savePlan = function(plan) {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $scope.plan.generatedSkillPlan = SkillPlanGenerator.generate($scope.plan.skillSeed);
            if($scope.edit) {
                $scope.plan.save().then(function(){
                    $state.go('app.plans.list');
                });
            } else {
                skillPlans.create(plan).then(function(){
                    $state.go('app.plans.list');
                });
            }

        };
    }
    /**
     * @ngdoc controller
     * @name plan.controllers:PlanCtrl
     * @description
     *
     * Controller for the individual plan view.
     * Adds the selected plan to the scope.
     */
    function PlanCtrl ($scope, $state, $stateParams, $ionicHistory, skillPlans) {
        $scope.plan = skillPlans.read($stateParams.id);
        $scope.delete = function(){
            skillPlans.remove($stateParams.id).then(function(){
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('app.plans.list');
            });
        };
    }
    angular
        .module('compendium.plan')
        .controller('PlansCtrl', ['$scope', 'lodash', 'skillPlans', PlansCtrl])
        .controller('PlansEditorCtrl', ['$scope', '$state', '$stateParams', '$ionicHistory', '$ionicModal', 'SkillPlanGenerator', 'lodash', 'skillPlans', PlansEditorCtrl])
        .controller('PlanCtrl', ['$scope', '$state', '$stateParams', '$ionicHistory', 'skillPlans', PlanCtrl]);
})();
