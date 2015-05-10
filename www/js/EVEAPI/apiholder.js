'use strict';
angular.module('apiholder', [])
.service('EVEAPIHolder', function($q, pouchDB, lodash, EVEAccount, EVECharacter, SkillQueue, Settings){
    var localDB = pouchDB('compendium');
    this.accounts = {};
    this.characters = {};
    this.init = function() {
        var self = this;
        var promises = [];
        var apiKeys = localDB.allDocs({include_docs: true, startkey: 'Account-', endkey: 'Account-\uffff'}).then(function(response){
            self.accounts = lodash.transform(response.rows, function(result, item) {
                result[item.doc.keyID] = lodash.create(EVEAccount.prototype, item.doc);
                return result;
            },{});
            return response;
        }).catch(function(error){
            console.log('EVEAPI:init', error);
            return error;
        });
        var characters = localDB.allDocs({include_docs: true, startkey: 'Character-', endkey: 'Character-\uffff'}).then(function(response){
            self.characters = lodash.transform(response.rows, function(result, item){
                result[item.doc.characterID] = lodash.create(EVECharacter.prototype, item.doc);
                return result;
            },{});
            return response;
        }).catch(function(error){
            console.log('EVEAPI:init', error);
        });
        var skillqueue = localDB.allDocs({include_docs: true, startkey: 'SkillQueue-', endkey: 'SkillQueue-\uffff'}).then(function(response){
            lodash.each(response.rows, function(item){
                self.characters[item.doc.characterID].skillQueue = lodash.create(SkillQueue.prototype, item.doc);
            });
            return response;
        }).catch(function(error){
            console.log('EVEAPI:init', error);
        });
        promises.push(apiKeys);
        promises.push(characters);
        promises.push(skillqueue);
        return $q.all(promises);
    };
    this.addKey = function(key) {
        var self = this;
        var dfd = $q.defer();
        self.accounts[key.id] = new EVEAccount(key.name, key.id, key.code);
        self.accounts[key.id].refresh().then(function(response) {
            return self.accounts[key.id].save();
        }).then(function(response){
            dfd.resolve(response);
        })
        .catch(function(error){
            dfd.reject(error);
        });
        return dfd.promise;
    };
    this.deleteKey = function(account) {
        var self = this;
        var dfd = $q.defer();
        lodash.each(account.characters, function(item) {
            self.characters[item].skillQueue.delete().then(function(response){
                delete self.characters[item].skillQueue;
                return self.characters[item].delete();
            }, function(error){
                return error;
            }).then(function(response){
                delete self.characters[item];
            }).catch(function(error){
                console.log(error);
                dfd.reject(error);
            });
        });
        account.delete().then(function(response){
            delete self.accounts[account.keyID];
            dfd.resolve(response);
        }).catch(function(error){
            console.log(error);
            dfd.reject(error);
        });
        return dfd.promise;
    };
    this.addCharacter = function(account, characterID) {
        var self = this;
        var dfd = $q.defer();
        self.characters[characterID] = new EVECharacter(characterID);
        self.characters[characterID].refresh(account.keyID, account.verificationCode).then(function(response) {
            return self.characters[characterID].save();
        }).then(function(response){
            dfd.resolve(response);
        }).catch(function(error){
            dfd.reject(error);
        });
        console.log('EVEAPI:addCharacter', self.characters[characterID]);
        return dfd.promise;
    };
    this.addSkillQueue = function(account, characterID) {
        var self = this;
        var dfd  = $q.defer();
        self.characters[characterID].skillQueue = new SkillQueue(characterID);
        self.characters[characterID].skillQueue.refresh(account.keyID, account.verificationCode).then(function(response){
            return self.characters[characterID].skillQueue.save();
        }).then(function(response){
            dfd.resolve(response);
        }).catch(function(error){
            dfd.reject(error);
        });
        return dfd.promise;
    };
    //TODO: Figure where to store synced status
    this.isOutOfDate = function() {
        var self = this;
        return ((lodash.now() - Settings.synced) >= Settings.syncRate*60000);
    };
    this.refresh = function() {
        var self = this;
        var promises = [];
        lodash.each(self.accounts, function(account) {
            account.refresh().then(function() {
                Settings.synced = lodash.now();
                promises.push(Settings.save());
                promises.push(account.save());
                lodash.each(account.characters, function(character) {
                    self.characters[character].refresh(account.keyID, account.verificationCode)
                    .then(function(){
                        promises.push(self.characters[character].save());
                    });
                    var oldQueue = self.characters[character].skillQueue.serialize();
                    self.characters[character].skillQueue.refresh(account.keyID, account.verificationCode)
                    .then(function(){
                        promises.push(self.characters[character].skillQueue.save());
                    });
                    checkIfSkillsComplete(self.characters[character].skills, oldQueue, self.characters[character].skillQueue);
                });
            });
        });
        if(promises.length === 0) {
            var dfd = $q.defer();
            dfd.reject('Nothing to update');
            return dfd.promise;
        }
        return $q.all(promises);
    };
    this.updateCharacters = function() {
        var self = this;
        var promises = [];
        lodash.each(self.accounts, function(account) {
            lodash.each(account.characters, function(character){
                if(typeof self.characters[character] === 'undefined') {
                    promises.push(self.addCharacter(account, character).then(function(response){
                        return self.addSkillQueue(account, character);
                    }, function(error){
                        return error;
                    }));
                }
            });
        });
        return $q.all(promises);
    };
    /**
     * @ngdoc function
     * @name checkIfSkillsComplete
     * @description
     *
     * Compares character's current skills, skill queue before and after refresh
     * to detect if skill training has finished.
     * First it creates symetrical difference between old and new skill queues,
     * showing the change after the refresh.
     * Then it creates intersection between current skill collection and
     * difference to see if any of the skills that changed have been moved
     * to current skills. Those that have will be sent to notification service
     * to notify the user of finished training.
     *
     * @param {array} Character's current skill collection
     * @param {array} Character's skill queue before refreshing
     * @param {array} Character's skill queue after refreshing
     */
    function checkIfSkillsComplete(current, old, future) {
        console.log('Checking');
        var difference = lodash.filter(old, function(skill) {
            return !(lodash.findWhere(future, {skillID: skill.skillID, level: skill.level}));
        });
        var intersection = lodash.filter(current, function(skill){
            return (lodash.findWhere(difference, {skillID: skill.skillID, level: skill.level}));
        });
        lodash.forEach(intersection, function(item){
            console.log(item);
        });
    }
});
