(function(){
    'use strict';
    /**
     * @ngdoc service
     * @name characters.services:SkillsQueue
     * @description
     *
     * Factory for new SkillsQueue object creation
     */
    function SkillsQueue(CONFIG, $q, $http, lodash, XML2JSON, SkillTree) {
        /**
         * @ngdoc method
         * @constructs SkillsQueue
         * @description
         *
         * Constructor creates new, blank SkillsQueue object.
         */
        var skillsQueue = function() {
            this._id = 'SkillsQueue-';
            this._rev = '';
            this.characterID = '';
            this.skills = [];
        };
        /**
         * @ngdoc method
         * @name refresh
         * @description
         *
         * Requests skill queue data from the EVE API
         * @param {string} keyID to be used with EVE API
         * @param {string} API key's verification code
         * @returns {object} Promise containing success or error message
         */
        skillsQueue.prototype.refresh = function(keyID, vCode) {
            var dfd = $q.defer();
            var self = this;
            $http.get(CONFIG.APIPath + 'char/SkillQueue.xml.aspx', {
                params: {
                    keyID: keyID,
                    characterID: self.characterID,
                    vCode: vCode
                }
            }).then(function(resp) {
                var data = XML2JSON.extractXML(resp);
                self.skills = lodash.map(data.rowset.row, function(item){
                    var temp = SkillTree.read(item._typeID);
                    return {
                        name: temp.skillName,
                        skillID: item._typeID,
                        level: lodash.parseInt(item._level),
                        startSP: lodash.parseInt(item._startSP),
                        endSP: lodash.parseInt(item._endSP),
                        startTime: new Date(item._startTime.replace(/-/g, '/')).valueOf(),
                        endTime: new Date(item._endTime.replace(/-/g, '/')).valueOf()
                    };
                });
                dfd.resolve(self.skills);
            });
            return dfd.promise;
        };
        return skillsQueue;
    }
    angular
        .module('compendium.characters')
            .factory('SkillsQueue', ['CONFIG', '$q', '$http', 'lodash', 'XML2JSON', 'SkillTree', SkillsQueue]);
})();
