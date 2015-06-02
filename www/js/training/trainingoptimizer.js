(function(){
    'use strict';
    function AttributeOptimizer($q, lodash, SkillTree) {
        this.optimize = function(trainingPlan) {
            var skillPoints = {
                1: 8,
                2: 46,
                3: 257,
                4: 1456,
                5: 8234
            };
            var temp = lodash.chain(trainingPlan)
            .map(function(skill) {
                var skillDetails = SkillTree.read(skill.skillID);
                skill.rank = skillDetails.rank;
                skill.requiredAttributes = skillDetails.requiredAttributes;
                return skill;
            })
            .reduce(function(result, skill) {
                var primaryWeight = skill.rank * skillPoints[skill.level];
                var secondaryWeight = (skill.rank * skillPoints[skill.level])/2;
                result[skill.requiredAttributes.primaryAttribute] += primaryWeight;
                result[skill.requiredAttributes.secondaryAttribute] += secondaryWeight;
                result.total += primaryWeight + secondaryWeight;
                return result;
            }, {
                charisma: 0,
                intelligence: 0,
                memory: 0,
                willpower: 0,
                perception: 0,
                total: 0
            })
            .value();
            var attributes = {
                charisma: 17 + (Math.round((temp.charisma / temp.total)*14) || 0),
                intelligence: 17 + (Math.round((temp.intelligence / temp.total)*14) || 0),
                memory: 17 + (Math.round((temp.memory / temp.total)*14) || 0),
                willpower: 17 + (Math.round((temp.willpower / temp.total)*14) || 0),
                perception: 17 + (Math.round((temp.perception / temp.total)*14) || 0)
            };
            return attributes;
        };
    }
    angular.module('compendium.training')
        .service('AttributeOptimizer', ['$q', 'lodash', 'SkillTree', AttributeOptimizer]);
})();
