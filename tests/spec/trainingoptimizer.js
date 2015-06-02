describe('AttributeOptimizer', function() {

    beforeEach(function() {
        angular.module('compendium.characters', []);
        angular.module('compendium.skilltree', []);
        module(function($provide) {
            $provide.service('SkillTree', function() {
                this.testSkills = {
                    '0': { skillID: '0', rank: 1, requiredAttributes: { primaryAttribute: 'charisma', secondaryAttribute: 'intelligence' } },
                    '1': { skillID: '1', rank: 5, requiredAttributes: { primaryAttribute: 'charisma', secondaryAttribute: 'intelligence' } },
                    '2': { skillID: '2', rank: 5, requiredAttributes: { primaryAttribute: 'memory', secondaryAttribute: 'willpower' } },
                    '3': { skillID: '3', rank: 5, requiredAttributes: { primaryAttribute: 'memory', secondaryAttribute: 'willpower' } }
                };
                this.read = function(id) {
                    return this.testSkills[id];
                 };
             });
        });
        module('ngLodash');
        module('compendium.training');
    });

    var AttributeOptimizer;
    beforeEach(inject(function(_AttributeOptimizer_) {
        AttributeOptimizer = _AttributeOptimizer_;
    }));

    //Test data
    var singleSkill = [
        { skillID: '0', level: 5}
        ];
    var twoSameAttributeSkills = [
        { skillID: '0', level: 5},
        { skillID: '1', level: 5}
    ];
    var twoDifferentAttribute = [
        { skillID: '1', level: 5},
        { skillID: '2', level: 5}
    ];

    var twoDifferentRankAttribute = [
        { skillID: '0', level: 5},
        { skillID: '2', level: 5},
    ];
    var twoDifferentLevelAttribute = [
        { skillID: '1', level: 5},
        { skillID: '3', level: 1}
    ];
    it('should have AttributeOptimizer service initiated', function() {
        expect(AttributeOptimizer).toBeDefined();
    });

    it('should not distribute any points when empty list is provided', function() {
        expect(AttributeOptimizer.optimize([])).toEqual({
            charisma: 17,
            intelligence: 17,
            memory: 17,
            willpower: 17,
            perception: 17
        });
    });

    it('should distribute attribute points the same if multiple of the same skill are in the list', function() {
        expect(AttributeOptimizer.optimize(singleSkill)).toEqual(AttributeOptimizer.optimize(twoSameAttributeSkills));
    });

    it('should equally distribute attributes for two skills with equal levels and ranks', function() {
        expect(AttributeOptimizer.optimize(twoDifferentAttribute)).toEqual({
                charisma: 22,
                intelligence: 19,
                memory: 22,
                willpower: 19,
                perception: 17
            }
        );
    });

    it('should distribute more attributes to skills with higher rank and or level', function(){
        var rank = AttributeOptimizer.optimize(twoDifferentRankAttribute);
        var level = AttributeOptimizer.optimize(twoDifferentLevelAttribute);
        expect(rank.memory).toBeGreaterThan(rank.charisma);
        expect(level.charisma).toBeGreaterThan(level.memory);
    });
});
