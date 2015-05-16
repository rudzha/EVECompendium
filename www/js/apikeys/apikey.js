(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name apikeys.services:APIKey
     * @description
     *
     * Factory to construct APIKey objects for API Key management
     */
    function APIKey (CONFIG, $q, $http, pouchDB, lodash, ObjectSerializer, XML2JSON) {
        var localDB = new pouchDB('compendium');
        /**
         * @ngdoc method
         * @constructs APIKey
         * @description
         *
         * Constructor used in APIKey creation,
         * sets intial, blank values;
         */
        var apiKey = function() {
            this.name = '';
            this._id = 'APIKey-';
            this._rev = '';
            this.keyID = '';
            this.verificationCode = '';
            this.expires = '';
            this.accessMask = '';
            this.status = 'New';
            this.characters = [];
        };
        /**
         * @ngdoc method
         * @name save
         * @description
         *
         * Saves APIKey object to database, uses ObjectSerializer to copy and
         * strip object
         * @returns {object} Promise containing database response
         */
        apiKey.prototype.save = function() {
            var self = this;
            var dfd = $q.defer();
            localDB.put(ObjectSerializer.serialize(self))
            .then(function(response){
                self._rev = response.rev;
                dfd.resolve(response);
            }).catch(function(error){
                dfd.reject(error);
            });
            return dfd.promise;
        };
        /**
         * @ngdoc method
         * @name delete
         * @description
         *
         * Deletes the APIKey object
         * @returns {object} Promise containing database response
         */
        apiKey.prototype.delete = function() {
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
         * @name refresh
         * @description
         *
         * Requests APIKey information from the EVE API
         * @returns {object} Promise containing success or error message
         */
        apiKey.prototype.refresh = function() {
            var dfd = $q.defer();
            var self = this;
            console.log(self.keyID, self.verificationCode);
            $http.get(CONFIG.APIPath + 'account/apikeyinfo.xml.aspx', {
                params: {
                    keyID: self.keyID,
                    vCode: self.verificationCode
                }
            }).then(function(resp) {
                var data = XML2JSON.extractXML(resp);
                self.expires = data.key._expires;
                self.accessMask = data.key._accessMask;
                self.characters = (lodash.isArray(data.key.rowset.row)) ? data.key.rowset.row : [data.key.rowset.row];
                self.characters = lodash.reduce(self.characters, function(result, item) {
                    result.push(item._characterID);
                    return result;
                }, []);
                self.status = 'Synced';
                dfd.resolve('Success');
            }).catch(function(err) {
                console.log('APIKeys', err);
                self.status = 'Failed';
                dfd.reject(err);
            });
            return dfd.promise;
        };
        return apiKey;
    }
    angular
        .module('compendium.apikeys')
            .factory('APIKey', ['CONFIG', '$q', '$http', 'pouchDB', 'lodash', 'ObjectSerializer', 'XML2JSON', APIKey]);
})();
