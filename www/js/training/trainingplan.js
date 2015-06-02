(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name training.service:TrainingPlan
     * @description
     *
     * Factory for creation of TrainingPlan objects.
     */
    function TrainingPlan($q, lodash, pouchDB, SkillsCurrentAll, SkillsQueues, SkillPlans, TrainingPlanGenerator, AttributeOptimizer) {
        var localDB = new pouchDB('compendium');
        /**
         * @ngdoc method
         * @constructs training.TrainingPlan
         * @description
         *
         * Initializes TrainingPlan object and it's properties
         */
        var trainingPlan = function () {
            this._id = '';
            this._rev = '';
            this.name = '';
            this.characterID = '';
            this.planID = '';
            this.trainingPlan = [];
            this.optimalAttributes = {
                charisma: 17,
                intelligence: 17,
                memory: 17,
                willpower: 17,
                perception: 17
            };
        };
        /**
         * @ngdoc method
         * @name save
         * @description
         *
         * Calls TrainingPlan's serialize method and then saves the returned Object
         * to database.
         *
         * @returns {object} A promise object which contains database response
         */
         trainingPlan.prototype.save = function() {
            var self = this;
            var dfd = $q.defer();
            localDB.put(self.serialize()).then(function(response){
                console.log('TrainingPlan:save', response);
                self._rev = response.rev;
                dfd.resolve(response);
            }).catch(function(error){
                console.log('TrainingPlan:save',error);
                dfd.reject(error);
            });
            return dfd.promise;
        };
        /**
         * @ngdoc method
         * @name delete
         * @description
         *
         * Deletes object from the database
         *
         * @returns {object} A promise object which contains database response
         */
         trainingPlan.prototype.delete = function() {
            var self = this;
            var dfd = $q.defer();
            localDB.get(self._id).then(function(response){
                return localDB.remove(response);
            }).then(function(response){
                dfd.resolve(response);
            }).catch(function(error){
                dfd.reject(error);
            });
            return dfd.promise;
        };
        trainingPlan.prototype.generate = function() {
            var self = this;
            var dfd = $q.defer();
            var char = SkillsCurrentAll.read(self.characterID).skills;
            var queue = SkillsQueues.read(self.characterID).skills;
            var plan = SkillPlans.read(self.planID).generatedSkillPlan;
            if(!lodash.isUndefined(char) && !lodash.isUndefined(plan) && !lodash.isUndefined(queue)){
                self.trainingPlan = TrainingPlanGenerator.generate(char, queue, plan);
                dfd.resolve(self);
            } else {
                dfd.reject('Missing parts');
            }
            return dfd.promise;
        };
        trainingPlan.prototype.optimize = function() {
            console.log('Optimizes');
            var self = this;
            var dfd = $q.defer();
            self.optimalAttributes = AttributeOptimizer.optimize(self.trainingPlan);
            dfd.resolve(self);
            return dfd.promise;
        };
        /**
         * @ngdoc method
         * @name serialize
         * @description
         *
         * Creates a copy of the TrainingPlan object's properites.
         * For the object to be saved it needs to be stripped of it's methods.
         *
         * @returns {object} Naked/stripped TrainingPlan object
         */
         trainingPlan.prototype.serialize = function() {
            var serialObj = {};
            for (var property in this) {
                if (this.hasOwnProperty(property)) {
                    serialObj[property] = this[property];
                }
            }
            return serialObj;
        };
        return trainingPlan;
    }
    angular.module('compendium.training')
        .factory('TrainingPlan', ['$q', 'lodash', 'pouchDB', 'SkillsCurrentAll', 'SkillsQueues', 'SkillPlans', 'TrainingPlanGenerator', 'AttributeOptimizer', TrainingPlan]);
})();
