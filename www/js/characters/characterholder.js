(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name characters.service:Characters
     * @description
     *
     * Interface for Charcter object management
     */
    function Characters ($q, pouchDB, ObjectSerializer, lodash, Character) {
        var localDB = new pouchDB('compendium');
        this.characters = {};
        this.outOfDate = false;
        /**
         * @ngdoc method
         * @name init
         * @description
         *
         * Queries the database for all Characters, then initilizes each Character
         * and adds it to the Charcters.characters dictionary
         *
         * @returns {object} Promise object, containing reference to Charcters
         */
        this.init = function () {
            var self = this;
            var dfd = $q.defer();
            localDB.allDocs({include_docs: true, startkey: 'Character-', endkey: 'Character-\uffff'}).then(function(response){
                self.characters = lodash.transform(response.rows, function(result, item) {
                    result[item.doc.characterID] = lodash.create(Character.prototype, item.doc);
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
         * Converts character dictionary to a list
         * @returns {array} Character list
         */
        this.list = function() {
            var self = this;
            return lodash.transform(self.characters, function(result, character){
                result.push(character);
            }, []);
        };
        /**
         * @ngdoc method
         * @name create
         * @description
         *
         * Takes a new Character object, assigns ID to it and saves it to database,
         * finally adds it to the character dictionary
         * @param {object} new Character object
         * @returns {object} promise containing Character.save response
         */
        this.create = function(character) {
            var self = this;
            character._id = character._id + character.characterID;
            return localDB.put(ObjectSerializer.serialize(character))
            .then(function(response){
                character._rev = response.rev;
                self.characters[character.characterID] = character;
                return character;
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
         * Looks up Character by id and returns it
         * @param {string} Character ID
         * @returns {object} Character object
         */
        this.read = function(id) {
            var self = this;
            return self.characters[id];
        };
        /**
         * @ngdoc method
         * @name update
         * @description
         *
         * Save Character to database
         * @param {string} Character ID
         * @returns {object} Promise containing Character.save response
         */
        this.update = function(character) {
            var self = this;
            return localDB.put(ObjectSerializer.serialize(character))
            .then(function(response){
                character._rev = response.rev;
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
         * Takes Character ID, gets it from database, removes it from,
         * once it's deleted, removes it from the dictionary
         */
        this.delete = function(id) {
            var self = this;
            return localDB.get(self.characters[id]._id)
            .then(function(response) {
                delete self.characters[id];
                return localDB.remove(response);
            })
            .catch(function(error){
                return error;
            });
        };
    }
    angular.module('compendium.characters')
        .service('Characters', ['$q', 'pouchDB', 'ObjectSerializer', 'lodash', 'Character', Characters]);
})();
