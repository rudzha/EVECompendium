'use strict';
angular.module('compendium.apiholder', [])
.service('EVEAPIHolder', function($q, pouchDB, lodash, EVEAccount, EVECharacter, SkillQueue, UserService){
    var localDB = pouchDB('compendium');
    this.accounts = {};
    this.characters = {};
    this.synced = 0;
    this.init = function() {
        var self = this;
        var promises = [];
        var apiKeys = localDB.get('APIKeys').then(function(response) {
            self.synced = response.synced;
            self.accounts = lodash.transform(response.accounts, function(result, item) {
                console.log(item);
                result[item.keyID] = lodash.create(EVEAccount.prototype, item);
                return result;
            }, {});
            return self.accounts;
        }).catch(function(error){
            if(error.status === 404) {
                return self.createDatabases();
            }
        });
        var characters = localDB.get('Characters').then(function(response) {
            self.characters = lodash.transform(response.characters, function(result, item) {
                console.log(item);
                result[item.characterID] = lodash.create(EVECharacter.prototype, item);
                result[item.characterID].skillQueue = lodash.create(SkillQueue.prototype, item.skillQueue);
                return result;
            });
            return self.characters;
        }).catch(function(error){
            if(error.status === 404) {
                console.log('Still undefined?');
            }
        });
        console.log(apiKeys);
        promises.push(apiKeys);
        promises.push(characters);
        return $q.all(promises);
    };
    this.addKey = function(key) {
        var self = this;
        var dfd = $q.defer();
        console.log(key);
        self.accounts[key.id] = new EVEAccount(key.name, key.id, key.code);
        self.accounts[key.id].refresh().then(function(){
            dfd.resolve(self.accounts[key.id]);
        });
        return dfd.promise;
    };
    this.addCharacter = function(character) {
        var self = this;
        var dfd = $q.defer();
        self.characters[character] = new EVECharacter(character);
        console.log('EVEAPI:addCharacter', self.characters[character]);
        dfd.resolve(self.characters[character]);
        return dfd.promise;
    };
    this.addSkillQueue = function(character) {
        var self = this;
        var dfd  = $q.defer();
        self.characters[character].skillQueue = new SkillQueue(character);
        dfd.resolve(self.characters[character].skillQueue);
        return dfd.promise;
    };
    this.createDatabases = function() {
        var promises = [];
        var apiKeys = {
            _id: 'APIKeys',
            accounts: {},
            synced: 0
        };
        var characters = {
            _id: 'Characters',
            characters: {}
        };
        promises.push(localDB.put(apiKeys));
        promises.push(localDB.put(characters));
        return $q.all(promises);
    };
    this.isOutOfDate = function() {
        var self = this;
        return ((lodash.now() - self.synced) >= UserService.syncRate);
    };
    this.refresh = function() {
        var self = this;
        var promises = [];
        lodash.each(self.accounts, function(account){
            account.refresh().then(function() {
                lodash.each(account.characters, function(character) {
                    promises.push(self.characters[character].refresh(account.keyID, account.verificationCode));
                    promises.push(self.characters[character].skillQueue.refresh(account.keyID, account.verificationCode));
                });
            });
        });
        if(promises.length === 0) {
            var dfd = $q.defer();
            dfd.reject('Nothing to update');
            return dfd.promise;
        }
        console.log(promises);
        return $q.all[promises];
    };
    this.save = function() {
        var self = this;
        var now = lodash.now();
        var promises = [];
        var apiKeys = localDB.get('APIKeys').then(function(response) {
            response.synced = now;
            response.accounts = self.accounts;
            return localDB.put(response);
        });
        var characters = localDB.get('Characters').then(function(response) {
            console.log(self.characters);
            response.characters = self.characters;
            return localDB.put(response);
        });
        promises.push(apiKeys);
        promises.push(characters);
        return $q.all[promises];
    };
    this.updateCharacters = function() {
        var self = this;
        var dfd = $q.defer();
        lodash.each(self.accounts, function(account) {
            lodash.each(account.characters, function(character){
                if(typeof self.characters[character] === 'undefined') {
                    self.addCharacter(character).then(function(response) {
                        return self.characters[character].refresh(account.keyID, account.verificationCode);
                    }).then(function(response){
                        return self.addSkillQueue(character);
                    }).then(function(response){
                        return self.characters[character].skillQueue.refresh(account.keyID, account.verificationCode);
                    });
                }
            });
        });
        dfd.resolve();
        return dfd.promise;
    };
    /*

    this.checkForNewCharacters = function () {
        var self = this;
        var dfd = $q.defer();
        var newchar = false;
        lodash.each(self.accounts, function(key) {
            lodash.each(key.characters, function(char){
                if(typeof self.characters[char] === 'undefined') {
                    self.add(char);
                    self.skillqueues[char] = new SkillQueue(char);
                    newchar = true;
                }
            });
        });
        dfd.resolve(newchar);
        return dfd.promise;
    };
    this.addKey = function(key) {
        var dfd = $q.defer();
        var self = this;
        self.accounts[key.id] = new EVEAccount(key.name, key.id, key.code);
        self.accounts[key.id].refresh().then(function(){
            dfd.resolve(self.accounts[key.id]);
        });
        return dfd.promise;
    };
    this.delete = function(keyID) {
        var dfd = $q.defer();
        var self = this;
        lodash.each(self.accounts[keyID].characters, function(char){
            delete self.characters[char];
        });
        delete self.accounts[keyID];
        dfd.resolve();
        return dfd.promise;
    };
    this.save = function() {
        var self = this;
        var dfd = $q.defer();
        var now = lodash.now();
        localDB.get('APIKeys').then(function(resp) {
            console.log(self.accounts, self.characters, self.skillqueues);
            resp.synced = now;
            resp.accounts = self.accounts;
            resp.characters = self.characters;
            resp.skillqueues = self.skillqueues;
            return localDB.put(resp);
        }).then(function(resp){
            console.log(resp);
            self.synced = now;
            dfd.resolve(resp);
        }).catch(function(err){
            console.log(err);
        });
        return dfd.promise;
    };
    this.refresh = function() {
        var self = this;
        var dfd = $q.defer();
        var deferedArray = [];
        lodash.each(self.accounts, function(key){
            deferedArray.push(key.refresh());
            lodash.each(key.characters, function(char) {
                deferedArray.push(self.characters[char].refresh(key.keyID, key.verificationCode));
                deferedArray.push(self.skillqueues[char].refresh(key.keyID, key.verificationCode));
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
    */
});
