(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name Settings
     * @description
     *
     * Settings serivice holds, stores and makes available user settings.
     */
    function Settings($q, lodash, pouchDB){
        var localDB = pouchDB('compendium');
        var self = this;
        this.selectedCharacter = '';
        this.syncRate = 15;
        this.synced = 0;
        this.queueMeterDays = 7;
        /**
         * @ngdoc method
         * @name init
         * @description
         *
         * Request user settings from the database and initilizes Settings
         * service with the response. If no settings entry is found in the
         * database, it creates new - default entry.
         *
         * @returns {object} returns promise object containing reference to
         * Settings service.
         */
        this.init = function() {
            var dfd = $q.defer();
            localDB.get('Settings').then(function(resp) {
                lodash.assign(self, resp);
                dfd.resolve(self);
            }).catch(function(err) {
                console.log(err);
                if(err.status === 404) {
                    var settings = {
                        _id: 'Settings',
                        selectedCharacter: '',
                        syncRate: 15,
                        queueMeterDays: 7,
                        synced: 0
                    };
                    localDB.put(settings).then(function(response){
                        dfd.resolve(self);
                    });
                }
            });
            return dfd.promise;
        };
        /**
         * @ngdoc method
         * @name save
         * @description
         *
         * Updates 'Settings' database entry with current user settings.
         * @returns {object} Returns promise containing server response.
         */
        this.save = function() {
            var dfd = $q.defer();
            localDB.get('Settings').then(function(resp) {
                resp.syncRate = self.syncRate;
                resp.selectedCharacter = self.selectedCharacter;
                resp.synced = self.synced;
                resp.queueMeterDays = self.queueMeterDays;
                return localDB.put(resp);
            }).then(function(resp){
                dfd.resolve(resp);
            }).catch(function(error){
                dfd.reject(error);
            });
            return dfd.promise;
        };
    }
    angular.module('compendium.settings')
        .service('Settings', ['$q', 'lodash', 'pouchDB', Settings]);
})();
