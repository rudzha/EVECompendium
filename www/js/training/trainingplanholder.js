(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name training.service:TrainingPlans
     * @description
     *
     * Interface for training plans collection. Provides CRUD like operations
     * for the training plan collection and resources.
     */
    function TrainingPlans($q, lodash, pouchDB, TrainingPlan) {
        var localDB = new pouchDB('compendium');
        this.plans = {};
        /**
         * @ngdoc method
         * @name init
         * @description
         *
         * Initializes TrainingPlans collection, filling it with TrainingPlan
         * resources from the database.
         * @returns {object} Promise object containing reference to the collection
         */
        this.init = function() {
            var self = this;
            var dfd = $q.defer();
            localDB.allDocs({
                include_docs: true,
                startkey: 'Training-',
                endkey: 'Training-\uffff'
                })
                .then(function(response) {
                    self.plans = lodash.transform(response.rows, function(result, item){
                        result[item.id] = lodash.create(TrainingPlan.prototype, item.doc);
                        return result;
                    }, {});
                    dfd.resolve(self);
                });
            return dfd.promise;
        };
        /**
         * @ngdoc method
         * @name list
         * @description
         *
         * @returns {object} Returns list of TrainingPlan in the form of an
         * associative array.
         */
        this.list = function() {
            var self = this;
            return self.plans;
        };
        /**
         * @ngdoc method
         * @name create
         * @description
         *
         * Takes TrainingPlan object, saves it and adds to the collection.
         * @param {object} TrainingPlan object
         * @returns {object} Promise containing database operation response.
         */
        this.create = function(training) {
            var self = this;
            var id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            training._id = 'Training-' + id;
            return training.save().then(function(response){
                self.plans[training._id] = training;
                return response;
            });
        };
        /**
         * @ngdoc method
         * @name read
         * @description
         *
         * Returns TrainingPlan object from the collection.
         * @param {string} ID of the requested TrainingPlan
         * @returns {object} Requested TrainingPlan object
         */
        this.read = function(id) {
            var self = this;
            return self.plans[id];
        };
        /**
         * @ngdoc method
         * @name update
         * @description
         *
         * Saves changes to the TrainingPlan.
         * @param {string} ID of the TrainingPlan to update
         * @returns {object} Promise containing database response
         */
        this.update = function(id) {
            var self = this;
            return self.plans[id].save();
        };
        /**
         * @ngdoc method
         * @name delete
         * @description
         *
         * Deletes TrainingFrom database and then deletes the object from the
         * collection.
         * @param {string} ID of the TrainingPlan to delete
         * @returns {object} Promise containing database response
         */
        this.delete = function(id) {
            var self = this;
            return self.plans[id].delete().then(function(response){
                delete self.plans[id];
                return response;
            });
        };
    }
    angular.module('compendium.training')
        .service('TrainingPlans', ['$q', 'lodash', 'pouchDB', 'TrainingPlan', TrainingPlans]);
})();
