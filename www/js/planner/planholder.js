(function(){
    'use strict';
    angular.module('plan')
    /**
     * @ngdoc service
     * @name plan.service:SkillPlans
     * @description
     *
     * Interface for Skill Plans, holds and let's you manage multiple
     * SkillPlans
     */
    .service('SkillPlans', function($q, SkillPlan, pouchDB, lodash) {
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
            var promises = [];
            var plans = localDB.allDocs({include_docs: true, startkey: 'Plan-', endkey: 'Plan-\uffff'}).then(function(response){
                self.skillPlans = lodash.transform(response.rows, function(result, item) {
                    result[item.id] = lodash.create(SkillPlan.prototype, item.doc);
                    return result;
                },{});
                return response;
            });
            promises.push(plans);
            return $q.all(promises);
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
            var id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            var temp = new SkillPlan(id, plan);
            return temp.save().then(function(response){
                self.skillPlans['Plan-'+id] = temp;
                console.log(self.skillPlans);
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
    });
})();
