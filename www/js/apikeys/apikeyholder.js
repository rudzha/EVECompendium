(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name apikeys.service:APIKeys
     * @description
     *
     * API Key interface to manage all APIKey objects
     */
    function APIKeys ($q, pouchDB, lodash, APIKey, ObjectSerializer) {
        var localDB = new pouchDB('compendium');
        this.keys = {};
        this.outOfDate = false;
        /**
         * @ngdoc method
         * @name init
         * @description
         *
         * Queries the database for all APIKeys, then initilizes each APIKey and
         * adds it to the APIKeys.keys dictionary
         *
         * @returns {object} Promise object, containing reference to APIKeys
         */
        this.init = function () {
            var self = this;
            var dfd = $q.defer();
            localDB.allDocs({include_docs: true, startkey: 'APIKey-', endkey: 'APIKey-\uffff'}).then(function(response) {
                self.keys = lodash.transform(response.rows, function(result, item) {
                    result[item.doc.keyID] = lodash.create(APIKey.prototype, item.doc);
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
         * Returns list of all APIKeys
         * @returns {array} APIKeys list
         */
        this.list = function() {
            var self = this;
            return lodash.transform(self.keys, function(result, key){
                result.push(key);
            }, []);
        };
        /**
         * @ngdoc method
         * @name create
         * @description
         *
         * Takes a new APIKey object, attaches id to it, saves it and adds it
         * to the APIKeys dictionary.
         * @param {object} APIKey object
         * @returns {object} Promise containing APIKey.save response
         */
        this.create = function(apikey) {
            var self = this;
            apikey._id = apikey._id + apikey.keyID;
            return localDB.put(ObjectSerializer.serialize(apikey))
            .then(function(response){
                console.log(response);
                apikey._rev = response.rev;
                self.keys[apikey.keyID] = apikey;
                return apikey;
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
         * Takes the id of requested object, looks it up in dictionary and returns
         * @param {string} APIKey ID
         * @returns {object} APIkey object
         */
        this.read = function(id) {
            var self = this;
            return self.keys[id];
        };
        /**
         * @ngdoc method
         * @name update
         * @description
         *
         * Takes APIKey ID and updates the said object in database
         * @param {string} APIkey ID
         * @returns {object} Promise containing APIKey.save response
         */
        this.update = function(apikey) {
            var self = this;
            return localDB.put(ObjectSerializer.serialize(apikey))
            .then(function(response){
                apikey._rev = response.rev;
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
         * Takes APIKey ID, looks it up in dictionary, calls it's delete method,
         * once it's deleted, removes it from the dictionary
         */
        this.delete = function(id) {
            var self = this;
            return localDB.get(self.keys[id]._id)
            .then(function(response) {
                delete self.keys[id];
                return localDB.remove(response);
            })
            .catch(function(error){
                return error;
            });
        };
    }
    angular.module('compendium.apikeys')
        .service('APIKeys', ['$q', 'pouchDB', 'lodash', 'APIKey', 'ObjectSerializer', APIKeys]);
})();
