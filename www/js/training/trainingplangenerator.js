(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name training:TrainingPlanGenerator
     * @description
     *
     * Provides methods to generate training plans.
     */
    function TrainingPlanGenerator($q, lodash) {
        /**
         * @ngdoc method
         * @name generate
         * @description
         *
         * Takes characters skills and a skill plan and returns a generated
         * list of skills character is missing.
         * First it expands character's skill list to contain every level of a
         * skill character has. Then it filters skillplan removing every skill
         * that is already in the expanded character's skill list.
         * @param {array} List of character's current skills
         * @param {array} List of skills from the SKillPlan
         * @returns {array} List of skills character requires
         */
        this.generate = function(charSkills, planSkills) {
            var generatedTrainingPlan = [];
            var expandedCharSkills = lodash.chain(charSkills)
            .map(function(skill) {
                var result = [];
                for(var index = 1; index <= skill.level; index++) {
                    result.push({skillID: skill.skillID, level: index});
                }
                return result;
            })
            .flatten()
            .value();
            var difference = lodash.filter(planSkills, function(skill) {
                return !(lodash.findWhere(expandedCharSkills, {skillID: skill.skillID, level: skill.level}));
            });
            return difference;
        };
    }
    angular.module('compendium.training')
        .service('TrainingPlanGenerator', ['$q', 'lodash', TrainingPlanGenerator]);
})();
