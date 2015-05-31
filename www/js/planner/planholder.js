(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name plan.service:SkillPlans
     * @description
     *
     * Interface for Skill Plans, holds and let's you manage multiple
     * SkillPlans
     */
    function SkillPlans ($q, SkillPlan, pouchDB, lodash, ObjectSerializer) {
        var localDB = new pouchDB('compendium');
        this.skillPlans = {};
        /**
         * @ngdoc method
         * @name init
         * @description
         *
         * Queries the database for all SkillPlans, then initilizes SkillPlans and
         * finally inserts them into an associative array.
         *
         * @returns {object} Promise object of database response.
         */
        this.init = function () {
            var self = this;
            var dfd = $q.defer();
            localDB.allDocs({include_docs: true, startkey: 'Plan-', endkey: 'Plan-\uffff'}).then(function(response){
                self.skillPlans = lodash.transform(response.rows, function(result, item) {
                    result[item.id] = lodash.create(SkillPlan.prototype, item.doc);
                    return result;
                },{});
                dfd.resolve(self);
            });
            return dfd.promise;
        };
        /**
         * @ngdoc method
         * @name list
         * @description
         *
         * Converts current skills dictionary to a list
         * @returns {array} SkillsCurrent list
         */
        this.list = function() {
            var self = this;
            return lodash.transform(self.skillPlans, function(result, plans){
                result.push(plans);
            }, []);
        };
        /**
         * @ngdoc method
         * @name create
         * @description
         *
         * Generates an ID and creates a SkillPlan, then saves it to dabase and
         * puts it in the associative array;
         *
         * @param {object} An object containing SkillPlan initial properties
         * @returns {object} A promise object which contains database response
         */
        this.create = function(plan) {
            var self = this;
            plan._id += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            return localDB.put(ObjectSerializer.serialize(plan))
            .then(function(response){
                plan._rev = response.rev;
                self.skillPlans[plan._id] = plan;
                return plan;
            });
        };
        /**
         * @ngdoc method
         * @name read
         * @description
         *
         * Looks up and returns a SkillPlan object
         * @param {string} ID of a SkillPlan
         * @returns {object} SkillPlan
         */
        this.read = function(id) {
            var self = this;
            return self.skillPlans[id];
        };
        /**
         * @ngdoc method
         * @name update
         * @description
         *
         * Save SkillsQueue to database
         * @param {object} SkillPlan
         * @returns {object} Promise containing SkillsQueue.save response
         */
        this.update = function(plan) {
            var self = this;
            return localDB.put(ObjectSerializer.serialize(plan))
            .then(function(response){
                plan._rev = response.rev;
            })
            .catch(function(error){
                return error;
            });
        };
        /**
         * @ngdoc method
         * @name remove
         * @description
         *
         * Calls the SkillPlan delete method and afterwards destroys the SkillPlan.
         *
         * @param {string} ID of a SkillPlan
         * @returns {object} A promise object which contains database response
         */
        this.remove = function(id) {
            var self = this;
            return self.skillPlans[id].delete().then(function(){
                delete self.skillPlans[id];
            });
        };
    }
    angular.module('compendium.plan')
        .service('SkillPlans', ['$q', 'SkillPlan', 'pouchDB', 'lodash', 'ObjectSerializer', SkillPlans]);
})();
