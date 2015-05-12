(function () {
    'use strict';
    /**
     * @ngdoc service
     * @name plan.service:SkillPlanGenerator
     * @description
     *
     * Takes a list of skills, recursively iterates over it,
     * grabing each skill's dependencies.
     * In the end it returns a list of skills and their dependendies,
     * ordered by depenendency.
     */
    function SkillPlanGenerator ($q, lodash, SkillTreeService) {
        /**
         * @ngdoc method
         * @name generate
         * @methodOf plan.
         * @description
         *
         * Method takes an array of Skill objects and iterates. Looking up each
         * skill's required skills and pushes them into the array.
         * List is reversed to match skill training order. Skills that require
         * multiple training levels are expanded. Duplicates are removed.
         * Finally skill names are attached to each skill and the array is returned.
         *
         * @param {array} Array of skills [{skillID: .., level: ..}, ..]
         * @returns {array}
         */
        this.generate = function(seed) {
            var skillList = lodash.chain(seed)
            .map(function(item) {
                var result = [item];
                for(var index = 0; index < result.length; index++){
                    lodash.forEach(SkillTreeService.get(result[index].skillID).requiredSkills, function(skill){
                        result.push(skill);
                    });
                }
                return result;
            })
            .reduceRight(function(result, item){
                return result.concat(item);
            })
            .reverse()
            .map(function(item) {
                var result = [];
                for(var index = 1; index <= item.level; index++) {
                    result.push({skillID: item.skillID, level: index});
                }
                return result;
            })
            .flatten()
            .uniq(function(item) {
                return [item.skillID, item.level].join();
            })
            .map(function(skill) {
                skill.name = SkillTreeService.get(skill.skillID).skillName;
                return skill;
            })
            .value();
            console.log(skillList);
            return skillList;
        };
    }
    angular.module('compendium.plan')
        .service('SkillPlanGenerator', ['$q', 'lodash', 'SkillTreeService', SkillPlanGenerator]);
})();
