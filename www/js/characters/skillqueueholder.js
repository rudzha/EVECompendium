(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name characters.service:SkillsQueues
     * @description
     *
     * Interface for SkillsQueue object management
     */
    function SkillsQueues ($q, pouchDB, lodash, SkillsQueue, ObjectSerializer) {
        var localDB = new pouchDB('compendium');
        this.skills = {};
        this.outOfDate = false;
        /**
         * @ngdoc method
         * @name init
         * @description
         *
         * Queries the database for all SkillsQueues, then initilizes each
         * SkillsQueue and adds it to the SkillsQueues.skills dictionary
         *
         * @returns {object} Promise object, containing reference to SkillsQueues
         */
        this.init = function () {
            var self = this;
            var dfd = $q.defer();
            localDB.allDocs({include_docs: true, startkey: 'SkillsQueue-', endkey: 'SkillsQueue-\uffff'})
            .then(function(response){
                self.skills = lodash.transform(response.rows, function(result, item) {
                    result[item.doc.characterID] = lodash.create(SkillsQueue.prototype, item.doc);
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
         * Converts skill queue dictionary to a list
         * @returns {array} SkillsQueue list
         */
        this.list = function() {
            var self = this;
            return lodash.transform(self.skills, function(result, skills){
                result.push(skills);
            }, []);
        };
        /**
         * @ngdoc method
         * @name create
         * @description
         *
         * Takes a new SkillQueue object, assigns ID to it and saves it to
         * database, finally adds it to the skill queue dictionary
         * @param {object} new SkillsQueue object
         * @returns {object} promise containing SkillsQueue.save response
         */
        this.create = function(skills) {
            var self = this;
            skills._id = skills._id + skills.characterID;
            return localDB.put(ObjectSerializer.serialize(skills))
            .then(function(response){
                skills._rev = response.rev;
                self.skills[skills.characterID] = skills;
                return skills;
            })
            .catch(function(error) {
                return error;
            });
        };
        /**
         * @ngdoc method
         * @name read
         * @description
         *
         * Looks up SkillsQueue by id and returns it
         * @param {string} SkillsQueue ID
         * @returns {object} SkillsQueue object
         */
        this.read = function(id) {
            var self = this;
            return self.skills[id];
        };
        /**
         * @ngdoc method
         * @name update
         * @description
         *
         * Save SkillsQueue to database
         * @param {string} SkillsQueue ID
         * @returns {object} Promise containing SkillsQueue.save response
         */
        this.update = function(skills) {
            var self = this;
            return localDB.put(ObjectSerializer.serialize(skills))
            .then(function(response){
                skills._rev = response.rev;
            })
            .catch(function(error){
                return error;
            });
        };
        /**
         * @ngdoc method
         * @name delete
         * @description
         *
         * Takes SkillsQueue ID, looks it up in dictionary, calls it's delete
         * method,once it's deleted, removes it from the dictionary
         */
        this.delete = function(id) {
            var self = this;
            return localDB.get(self.skills[id]._id)
            .then(function(response) {
                delete self.skills[id];
                return localDB.remove(response);
            })
            .catch(function(error){
                return error;
            });
        };
    }
    angular.module('compendium.characters')
        .service('SkillsQueues', ['$q', 'pouchDB', 'lodash', 'SkillsQueue', 'ObjectSerializer', SkillsQueues]);
})();
