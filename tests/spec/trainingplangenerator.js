describe('TrainingPlanGenerator', function() {

    beforeEach(function(){
        angular.module('compendium.characters', []);

        module('ngLodash');
        module('compendium.training');
    });

    var TrainingPlanGenerator;
    beforeEach(inject(function(_TrainingPlanGenerator_) {
        TrainingPlanGenerator = _TrainingPlanGenerator_;
    }));

    //Test data
    /*
    * Character's existing skills
    */
    var charSkills = [
        { skillID: '0', level: 0 },
        { skillID: '1', level: 1 },
        { skillID: '2', level: 2 }
    ];

    /*
    * Character's queued skills
    */
    var queueSkills = [
        { skillID: '1', level: 2 },
        { skillID: '2', level: 3 }
    ];

    /*
    * User's generated skill plan
    */
    var planSkills = [
        { skillID: '1', level: 2 },
        { skillID: '2', level: 2 },
        { skillID: '3', level: 3 }
    ];
    var randomSkills = [
        { skillID: '7', level: 3 },
        { skillID: '18', level: 1 },
        { skillID: 'das', level: 5 }
    ]

    it('should have TrainingPlanGenerator service initiated', function() {
        expect(TrainingPlanGenerator).toBeDefined();
    });

    it('should generate an empty training plan from empty skill plan', function(){
        expect(TrainingPlanGenerator.generate([], [], [])).toEqual([]);
        expect(TrainingPlanGenerator.generate(charSkills, queueSkills, [])).toEqual([]);
    });

    it('should generate a plan for skills that character doesn\'t possess', function(){
        expect(TrainingPlanGenerator.generate(charSkills, queueSkills, charSkills)).toEqual([]);

        expect(TrainingPlanGenerator.generate(charSkills, queueSkills, planSkills)).toEqual([
            { skillID: '1', level: 2, bookNeeded: false, inQueue: true },
            { skillID: '3', level: 3, bookNeeded: true, inQueue: false }
        ]);
    });

    it('should mark skills already present in skill queue', function(){
        expect(TrainingPlanGenerator.generate(charSkills, queueSkills, queueSkills)).toEqual([
            { skillID: '1', level: 2, bookNeeded: false, inQueue: true },
            { skillID: '2', level: 3, bookNeeded: false, inQueue: true }
        ]);
    });

    it('should mark skills not possed by character', function() {
        expect(TrainingPlanGenerator.generate(charSkills, queueSkills, randomSkills)).toEqual(randomSkills);
    });

    it('should generate an empty training plan from empty skill plan', function(){
        expect(TrainingPlanGenerator.generate(charSkills, queueSkills, planSkills)).toEqual([
            { skillID: '1', level: 2, bookNeeded: false, inQueue: true },
            { skillID: '3', level: 3, bookNeeded: true, inQueue: false }
        ]);
    });

});
