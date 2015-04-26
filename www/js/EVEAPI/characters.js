'use strict';
angular.module('compendium.characters', [])
.factory('SkillQueue', function(CONFIG, $http, $q, XML2JSON, lodash){
    var SkillQueue = function(characterID) {
        this.characterID = characterID;
        this.queue = [];
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
                    startTime: new Date(item._startTime).valueOf(),
                    endTime: new Date(item._endTime).valueOf()
                };
            });
            dfd.resolve(self.queue);
            console.log('EVEAPI:SkillQueue', self.queue);
        });
        return dfd.promise;
    };
    return SkillQueue;
})
.factory('EVECharacter', function(CONFIG, $http, $q, XML2JSON, lodash){
    var Character = function(charID) {
        this.characterID = charID;
        this.name = '';
        this.corporationName = '';
        this.allianceName = '';
        this.balance = '';
        this.skills = [];
        this.attributes = [];
        this.skillQueue = [];
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
})
.factory('EVEAccount', function(CONFIG, $http, $q, XML2JSON, lodash) {
    var Account = function(name, key, code) {
        this.name = name;
        this.keyID = key;
        this.verificationCode = code;
        this.expires = '';
        this.accessMask = 0;
        this.status = 'None';
        this.characters = [];
    };
    Account.prototype.refresh = function () {
        var dfd = $q.defer();
        var self = this;
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
            console.log('EVEAPI:Account', err);
            self.status = 'Failed';
            dfd.reject(err);
        });
        return dfd.promise;
    };
    return Account;
});
