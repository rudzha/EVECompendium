'use strict';
angular.module('compendium.skillqueue', [])
.factory('SkillQueue', function(CONFIG, $http, $q, XML2JSON, lodash, pouchDB) {
    var localDB = new pouchDB('compendium');
    var SkillQueue = function(characterID) {
        this._id = 'SkillQueue-' + characterID;
        this._rev = '';
        this.characterID = characterID;
        this.queue = [];
    };
    SkillQueue.prototype.save = function() {
        var self = this;
        var dfd = $q.defer();
        localDB.put(self.serialize()).then(function(response){
            console.log(response);
            self._rev = response.rev;
            dfd.resolve(response);
        }).catch(function(error){
            console.log(error);
            dfd.reject(error);
        });
        return dfd.promise;
    };
    SkillQueue.prototype.delete = function() {
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
    SkillQueue.prototype.serialize = function() {
        var serialObj = {};
        for (var property in this) {
            if (this.hasOwnProperty(property)) {
                serialObj[property] = this[property];
            }
        }
        return serialObj;
    };
    SkillQueue.prototype.refresh = function(keyID, vCode) {
        var dfd = $q.defer();
        var self = this;
        $http.get(CONFIG.APIPath + 'char/SkillQueue.xml.aspx', {
            params: {
                keyID: keyID,
                characterID: self.characterID,
                vCode: vCode
            }
        }).then(function(response) {
            var data = XML2JSON.extractXML(response);
            self.queue = lodash.map(data.rowset.row, function(item){
                return {
                    skillID: item._typeID,
                    level: lodash.parseInt(item._level),
                    startSP: lodash.parseInt(item._startSP),
                    endSP: lodash.parseInt(item._endSP),
                    startTime: new Date(item._startTime.replace(/-/g, '/')).valueOf(),
                    endTime: new Date(item._endTime.replace(/-/g, '/')).valueOf()
                };
            });
            dfd.resolve(self.queue);
            console.log('EVEAPI:SkillQueue', self.queue);
        });
        return dfd.promise;
    };
    return SkillQueue;
});
