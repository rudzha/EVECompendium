(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name plan.service:SkillPlan
     * @description
     *
     * Skill plan factory that returns a SkillPlan object.
     * Used to store and managa individual SkillPlans
     */
    function SkillPlan ($q, lodash, pouchDB) {
        var localDB = new pouchDB('compendium');
        /**
         * @ngdoc method
         * @constructs plan.SkillPlan
         * @description
         *
         * Initializes SkillPlan object with it's properties
         *
         * @param {string} Randomly generated ID used to store the object
         * @param {object} Object containing properties
         */
        var skillPlan = function() {
            this._id = 'Plan-';
            this._rev = '';
            this.name = '';
            this.skillSeed = [];
            this.generatedSkillPlan = [];
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
        skillPlan.prototype.delete = function() {
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
        return skillPlan;
    }
    angular.module('compendium.plan')
        .factory('SkillPlan', ['$q', 'lodash', 'pouchDB', SkillPlan]);
})();
