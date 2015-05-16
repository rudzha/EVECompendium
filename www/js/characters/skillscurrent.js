(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name characters.services:SkillsCurrent
     * @description
     *
     * Factory for new SkillsCurrent object creation
     */
    function SkillsCurrent(CONFIG, $q, $http, pouchDB, lodash, ObjectSerializer, XML2JSON, SkillTree) {
        var localDB = new pouchDB('compendium');
        /**
         * @ngdoc method
         * @constructs Character
         * @description
         *
         * Constructor creates new, blank Character object.
         */
        var skillsCurrent = function() {
            this._id = 'SkillsCurrent-';
            this._rev = '';
            this.characterID = '';
            this.skills = [];
        };
        /**
         * @ngdoc method
         * @name save
         * @description
         *
         * Saves SkillsCurrent object to database
         * @returns {object} Promise containing database response
         */
        skillsCurrent.prototype.save = function() {
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
         * Deletes SkillsCurrent object from database
         * @returns {object} Promise containing database response
         */
        skillsCurrent.prototype.delete = function() {
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
         * Requests characters skill queue data from the EVE API
         * @param {string} keyID to be used with EVE API
         * @param {string} API keys verification code
         * @returns {object} Promise containing success or error message
         */
        skillsCurrent.prototype.refresh = function(keyID, vCode) {
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
                self.skills = lodash.map(data.rowset[3].row, function(item){
                    var temp = SkillTree.read(item._typeID);
                    return {name: temp.skillName,
                            group: temp.groupName,
                            skillID: item._typeID,
                            skillpoints: item._skillpoints,
                            level: lodash.parseInt(item._level)
                    };
                });
                dfd.resolve(self.skills);
            }).catch(function(err) {
                dfd.reject(err);
            });
            return dfd.promise;
        };
        return skillsCurrent;
    }
    angular
        .module('compendium.characters')
            .factory('SkillsCurrent', ['CONFIG', '$q', '$http', 'pouchDB', 'lodash', 'ObjectSerializer', 'XML2JSON', 'SkillTree', SkillsCurrent]);
})();
