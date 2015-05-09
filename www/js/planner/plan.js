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
        var SkillPlan = function(id, obj) {
            this._id = 'Plan-'+ id;
            this._rev = '';
            this.name = obj.name;
            this.skillSeed = obj.skillSeed || {};
            this.generatedSkillPlan = obj.generatedSkillPlan || {};
        };
        /**
         * @ngdoc method
         * @name save
         * @description
         *
         * Calls SkillPlan's serialize method and then saves the returned Object
         * to database.
         *
         * @returns {object} A promise object which contains database response
         */
        SkillPlan.prototype.save = function() {
            var self = this;
            var dfd = $q.defer();
            localDB.put(self.serialize()).then(function(response){
                console.log('SkillPlan:save', response);
                self._rev = response.rev;
                dfd.resolve(response);
            }).catch(function(error){
                console.log('SkillPlan:save',error);
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
        SkillPlan.prototype.delete = function() {
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
        /**
         * @ngdoc method
         * @name serialize
         * @description
         *
         * Creates a copy of the SkillPlan object's properites.
         * For the object to be saved it needs to be stripped of it's methods.
         *
         * @returns {object} Naked/stripped SkillPlan object
         */
        SkillPlan.prototype.serialize = function() {
            var serialObj = {};
            for (var property in this) {
                if (this.hasOwnProperty(property)) {
                    serialObj[property] = this[property];
                }
            }
            return serialObj;
        };
        return SkillPlan;
    }
    angular.module('compendium.plan')
        .factory('SkillPlan', ['$q', 'lodash', 'pouchDB', SkillPlan]);
})();
