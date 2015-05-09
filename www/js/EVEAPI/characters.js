'use strict';
angular.module('characters', [])
.factory('EVECharacter', function(CONFIG, $http, $q, XML2JSON, lodash, pouchDB){
    var localDB = new pouchDB('compendium');
    var Character = function(characterID) {
        this._id = 'Character-' + characterID;
        this._rev = '';
        this.type = 'character';
        this.characterID = characterID;
        this.name = '';
        this.corporationName = '';
        this.allianceName = '';
        this.balance = '';
        this.skills = [];
        this.attributes = [];
        this.skillQueue = [];
    };
    Character.prototype.save = function() {
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
    Character.prototype.delete = function() {
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
    Character.prototype.serialize = function() {
        var serialObj = {};
        for (var property in this) {
            if (this.hasOwnProperty(property)) {
                serialObj[property] = this[property];
            }
        }
        return serialObj;
    };
    Character.prototype.refresh = function(keyID, vCode) {
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
            self.skills = lodash.map(data.rowset[3].row, function(item){
                return {skillID: item._typeID, skillpoints: item._skillpoints, level: lodash.parseInt(item._level)};
            });
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
            console.log('EVEAPI:Character', self);
        }).catch(function(err) {
            console.log('EVEAPI:Character', err);
            dfd.reject(err);
        });
        return dfd.promise;
    };
    return Character;
});
