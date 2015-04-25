'use strict';
angular.module('starter.eveapi', [])
.service('EVEAPIHolder', function($q, pouchDB, lodash, EVEAccount, EVECharacter){
    var localDB = pouchDB('compendium');
    var self = this;
    this.accounts = {};
    this.characters = {};
    this.synced = 0;
    this.init = function() {
        var dfd = $q.defer();
        localDB.get('APIKeys').then(function(resp){
            self.accounts = lodash.transform(resp.accounts, function(result, item) {
                result[item.keyID] = lodash.create(EVEAccount.prototype, item);
                return result;
            },{});
            self.characters = lodash.transform(resp.characters, function(result, item) {
                result[item.characterID] = lodash.create(EVECharacter.prototype, item);
                return result;
            });
            self.synced = resp.synced;
            dfd.resolve();
        }).catch(function(err) {
            console.log(err);
            if(err.status === 404) {
                var apiKeys = {
                    _id: 'APIKeys',
                    accounts: {},
                    characters: {},
                    synced: 0
                };
                localDB.put(apiKeys).then(function(){
                    dfd.resolve();
                });
            }
        });
        return dfd.promise;
    };
    this.isOutOfDate = function() {
        return ((lodash.now() - self.synced) >= 3600);
    };
    this.checkForNewCharacters = function (){
        var dfd = $q.defer();
        var newchar = false;
        lodash.each(self.accounts, function(key) {
            lodash.each(key.characters, function(char){
                if(typeof self.characters[char] === 'undefined') {
                    self.characters[char] = new EVECharacter(char);
                    newchar = true;
                }
            });
        });
        dfd.resolve(newchar);
        return dfd.promise;
    };
    this.add = function(key) {
        var dfd = $q.defer();
        this.accounts[key.id] = new EVEAccount(key.name, key.id, key.code);
        this.accounts[key.id].refresh().then(function(){
            dfd.resolve();
        });
        return dfd.promise;
    };
    this.delete = function(keyID) {
        var dfd = $q.defer();
        lodash.each(self.accounts[keyID].characters, function(char){
            delete self.characters[char];
        });
        delete self.accounts[keyID];
        dfd.resolve();
        return dfd.promise;
    };
    this.save = function() {
        var dfd = $q.defer();
        var now = lodash.now();
        localDB.get('APIKeys').then(function(resp) {
            resp.synced = now;
            resp.accounts = self.accounts;
            resp.characters = self.characters;
            return localDB.put(resp);
        }).then(function(resp){
            self.synced = now;
            dfd.resolve(resp);
        });
        return dfd.promise;
    };
    this.refresh = function() {
        var dfd = $q.defer();
        var deferedArray = [];
        lodash.each(self.accounts, function(key){
            deferedArray.push(key.refresh());
            lodash.each(key.characters, function(char) {
                deferedArray.push(self.characters[char].refresh(key.keyID, key.verificationCode));
            });
        });
        $q.all(deferedArray).then(function(){
            dfd.resolve();
        }).catch(function(err){
            console.log(err);
            dfd.reject(err);
        });
        return dfd.promise;
    };
})
.factory('EVECharacter', function(CONFIG, $http, $q, x2js, lodash){
    var extractXML = function(xml){
        return x2js.xml_str2json(xml.data).eveapi.result;
    };

    var Character = function(charID) {
        this.characterID = charID;
        this.name = '';
        this.corporationName = '';
        this.allianceName = '';
        this.balance = '';
        this.skills = [];
        this.attributes = [];
    };

    Character.prototype.refresh = function(keyID, vCode) {
        var dfd = $q.defer();
        var self = this;
        $http.get(CONFIG.APIPath + 'char/CharacterSheet.xml.aspx', {
            params: {
                keyID: keyID,
                characterID: this.characterID,
                vCode: vCode
            }
        }).then(function(resp) {
            var data = extractXML(resp);
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
            dfd.resolve();
            console.log('EVEAPI:Character', self);
        }).catch(function(err) {
            console.log('EVEAPI:Character', err);
            dfd.reject(err);
        });
        return dfd.promise;
    };
    return Character;
})
.factory('EVEAccount', function(CONFIG, $http, $q, x2js, lodash) {
    var extractXML = function(xml){
        return x2js.xml_str2json(xml.data).eveapi.result;
    };

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
                keyID: this.keyID,
                vCode: this.verificationCode
            }
        }).then(function(resp) {
            var data = extractXML(resp);
            self.expires = data.key._expires;
            self.accessMask = data.key._accessMask;
            self.characters = (lodash.isArray(data.key.rowset.row)) ? data.key.rowset.row : [data.key.rowset.row];
            self.characters = lodash.reduce(self.characters, function(result, item) {
                result.push(item._characterID);
                return result;
            }, []);
            self.status = 'Synced';
            dfd.resolve();
        }).catch(function(err) {
            console.log('EVEAPI:Account', err);
            self.status = 'Failed';
            dfd.reject();
        });
        return dfd.promise;
    };

    return Account;
});
