(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name characters.service:SkillsCurrentAll
     * @description
     *
     * Interface for SkillsCurrentAll object management
     */
    function SkillsCurrentAll ($q, pouchDB, lodash, SkillsCurrent, ObjectSerializer) {
        var localDB = new pouchDB('compendium');
        this.skills = {};
        this.outOfDate = false;
        /**
         * @ngdoc method
         * @name init
         * @description
         *
         * Queries the database for all SkillsCurrent, then initilizes each
         * SkillsCurrent
         * and adds it to the SkillsCurrentAll.SkillsCurrent dictionary
         *
         * @returns {object} Promise object, containing reference to SkillsCurrentAll
         */
        this.init = function () {
            var self = this;
            var dfd = $q.defer();
            localDB.allDocs({include_docs: true, startkey: 'SkillsCurrent-', endkey: 'SkillsCurrent-\uffff'}).then(function(response){
                self.skills = lodash.transform(response.rows, function(result, item) {
                    result[item.doc.characterID] = lodash.create(SkillsCurrent.prototype, item.doc);
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
            return lodash.transform(self.skills, function(result, skills){
                result.push(skills);
            }, []);
        };
        /**
         * @ngdoc method
         * @name create
         * @description
         *
         * Takes a new SkillsCurrent object, assigns ID to it and saves it to
         * database, finally adds it to the current skill dictionary
         * @param {object} new Character object
         * @returns {object} promise containing Character.save response
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
         * Looks up SkillsCurrent by ID and returns it
         * @param {string} SkillsCurrent ID
         * @returns {object} SkillsCurrent object
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
         * Save SkillsCurrent to database
         * @param {string} SkillsCurrent ID
         * @returns {object} Promise containing SkillsCurrent.save response
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
         * Takes SkillsCurrent ID, looks it up in dictionary, calls it's delete
         * method, once it's deleted, removes it from the dictionary
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
        .service('SkillsCurrentAll', ['$q', 'pouchDB', 'lodash', 'SkillsCurrent', 'ObjectSerializer', SkillsCurrentAll]);
})();
