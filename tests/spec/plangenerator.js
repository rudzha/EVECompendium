'use strict';

describe('SkillPlanGenerator', function(){
    // dependency injection and mocking
    beforeEach(function() {
        angular.module('compendium.skilltree', []);
        module(function($provide) {
            $provide.service('SkillTree', function() {
                this.testSkills = {
                    '0': { skillID: '0', skillName: 'A', requiredSkills: [] },
                    '1': { skillID: '1', skillName: 'BA', requiredSkills: [{skillID: '0', level: 1}] },
                    '2': { skillID: '2', skillName: 'CA', requiredSkills: [{skillID: '0', level: 5}] }
                };
                this.read = function(id) {
                    return this.testSkills[id];
                 };
             });
        });
        module('ngLodash');
        module('cb.x2js');
        module('compendium.utilities');

        module('compendium.plan');
    });

    // test target module setup
    var SkillPlanGenerator;

    // test data
    var skillA = { skillID: '0', level: 1, requiredSkills: [] };
    var skillBA = { skillID: '1', level: 1, requiredSkills: [ {skillID: '0', level: 1} ] };
    var skillCA = { skillID: '2', level: 1, requiredSkills: [ {skillID: '0', level: 5} ] };

    beforeEach(inject(function(_SkillPlanGenerator_){
        SkillPlanGenerator = _SkillPlanGenerator_;
    }));

    it('should have SkillPlanGenerator service initiated', function(){
        expect(SkillPlanGenerator).toBeDefined();
    });

    it('should generate an empty skill plan from empty seed', function(){
        expect(SkillPlanGenerator.generate([])).toEqual([]);
    });

    it('should generate a plan with 1 skill from a seed with 1 skill and 0 dependency', function() {
        expect(SkillPlanGenerator.generate([skillA])).toEqual([
            { skillID: '0', level: 1, name:'A' }
        ]);
    });

    it('should generate a plan with 2 skills from a seed with 1 skill that has one level 1 dependency', function(){
        expect(SkillPlanGenerator.generate([skillBA])).toEqual([
            { skillID: '0', name:'A', level: 1 },
            { skillID: '1', name: 'BA', level:1 }
        ]);
    });

    it('should generate a plan with 6 skills from a seed with 1 skill with one dependency', function(){
        expect(SkillPlanGenerator.generate([skillCA])).toEqual([
            { skillID: '0', name:'A', level: 1 },
            { skillID: '0', name:'A', level: 2 },
            { skillID: '0', name:'A', level: 3 },
            { skillID: '0', name:'A', level: 4 },
            { skillID: '0', name:'A', level: 5 },
            { skillID: '2', name: 'CA', level:1 }
        ]);
    });

    it('should not duplicate dependencies and order should be maintained', function(){
        expect(SkillPlanGenerator.generate([skillCA, skillBA])).toEqual([
            { skillID: '0', name:'A', level: 1 },
            { skillID: '0', name:'A', level: 2 },
            { skillID: '0', name:'A', level: 3 },
            { skillID: '0', name:'A', level: 4 },
            { skillID: '0', name:'A', level: 5 },
            { skillID: '2', name: 'CA', level: 1 },
            { skillID: '1', name: 'BA', level: 1 }
        ]);
    });
});
