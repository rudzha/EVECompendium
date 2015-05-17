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
         * that is already in the expanded character's skill list. Once list is
         * filtered, it checks if a skillbook is required for each skill.
         * Finally it compares it to the character's skill queue and checks if
         * skills are already present in the skill queue
         * @param {array} List of character's current skills
         * @param {array} List of skills from the SKillPlan
         * @returns {array} List of skills character requires
         */
        this.generate = function(charSkills, queueSkills, planSkills) {
            var expandedCharSkills = lodash.chain(charSkills)
            .map(function(skill) {
                var result = [];
                for(var index = 0; index <= skill.level; index++) {
                    result.push({skillID: skill.skillID, level: index});
                }
                return result;
            })
            .flatten()
            .value();

            var generatedTrainingPlan = lodash.chain(planSkills)
            .filter(function(skill) {
                return !(lodash.findWhere(expandedCharSkills, {skillID: skill.skillID, level: skill.level}));
            })
            .map(function(skill) {
                skill.bookNeeded = !lodash.findWhere(expandedCharSkills, {skillID: skill.skillID, level: 0});
                return skill;
            })
            .map(function(skill) {
                skill.inQueue = !!lodash.findWhere(queueSkills, {skillID: skill.skillID, level: skill.level});
                return skill;
            })
            .value();
            return generatedTrainingPlan;
        };
    }
    angular.module('compendium.training')
        .service('TrainingPlanGenerator', ['$q', 'lodash', TrainingPlanGenerator]);
})();
