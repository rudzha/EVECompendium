(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name characters.services:Character
     * @description
     *
     * Factory for new Character object creation
     */
    function Character(CONFIG, $q, $http, lodash, XML2JSON) {
        /**
         * @ngdoc method
         * @constructs Character
         * @description
         *
         * Constructor creates new, blank Character object.
         */
        var character = function() {
            this._id = 'Character-';
            this._rev = '';
            this.characterID = '';
            this.name = '';
            this.dateOfBirth = '';
            this.race = '';
            this.bloodline = '';
            this.ancestry = '';
            this.corporationName = '';
            this.allianceName = '';
            this.balance = '';
            this.attributes = [];
        };
        /**
         * @ngdoc method
         * @name refresh
         * @description
         *
         * Requests character data from the EVE API
         * @param {string} keyID to be used with EVE API
         * @param {string} API keys verification code
         * @returns {object} Promise containing success or error message
         */
        character.prototype.refresh = function(keyID, vCode) {
            var dfd = $q.defer();
            var self = this;
            $http.get(CONFIG.APIPath + 'char/CharacterSheet.xml.aspx', {
                params: {
                    keyID: keyID,
                    characterID: self.characterID,
                    vCode: vCode
                }
            }).then(function(resp) {
                var data = XML2JSON.extractXML(resp);
                self.name = data.name;
                self.dateOfBirth = data.DoB;
                self.race = data.race;
                self.bloodline = data.bloodLine;
                self.ancestry = data.ancestry;
                self.corporationName = data.corporationName;
                self.allianceName = data.allianceName;
                self.balance = data.balance;
                self.attributes = data.attributes;
                self.implants = lodash.map(
                    lodash.isArray(data.rowset[2].row) ? data.rowset[2].row : (typeof data.rowset[2].row === 'undefined') ? [] : [data.rowset[2].row],
                    function(item) {
                    return {
                        implantID: item._typeID,
                        implantName: item._typeName
                    };
                });
                dfd.resolve('Success');
            }).catch(function(err) {
                dfd.reject(err);
            });
            return dfd.promise;
        };
        return character;
    }
    angular
        .module('compendium.characters')
            .factory('Character', ['CONFIG', '$q', '$http', 'lodash', 'XML2JSON', Character]);
})();
