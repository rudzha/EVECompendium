'use strict';
angular.module('starter.services', [])
.service('UserService', function(){
    this.selectedAPIKey = '';
    this.selectedCharacter = '';
})
.service('APIKeyService', function(EVEAPIHolder, pouchDB, $q){
    var localDB = pouchDB('compendium');
    this.init = function () {
        var dfd = $q.defer();
        localDB.get('APIKeys').then(function(resp){
            dfd.resolve(resp);
            console.log(resp);
        }).catch(function(err){
            console.log(err);
            if(err.status === 404) {
                var keys = {
                    _id: 'APIKeys',
                    keys: []
                };
                localDB.put(keys);
            }
        });
        return dfd.promise;
    };
    this.listKeys = function (){
        var dfd = $q.defer();
        localDB.get('APIKeys')
        .then(function(response){
            dfd.resolve(response.keys);
        })
        .catch(function(err){
            console.log('APIKeyService', err);
            dfd.resolve([]);
        });
        return dfd.promise;
    };
    this.createKey = function(key) {
        var dfd = $q.defer();
        localDB.get('APIKeys')
        .then(
            function(apikeys){
                apikeys.keys.push(key);
                localDB.put(apikeys);
                return apikeys;
            }
        ).then(function(apikeys){
            dfd.resolve(apikeys.keys);
        });
        EVEAPIHolder.add(key);
        return dfd.promise;
    };
    this.readKey = function (keyid) {
        var dfd = $q.defer();
        localDB.get('APIKeys').then(function(response){
            console.log(response);
            response.keys.forEach(function(key){
                if(key.id === keyid) {
                    dfd.resolve(key);
                }
            });
        }).catch(function(err){
            console.log(err);
        });
        return dfd.promise;
    };
    this.deleteKey = function (keyid) {
        var dfd = $q.defer();
        localDB.get('APIKeys')
        .then(function(response){
            for(var i = 0; i < response.keys.length; i++){
                if(response.keys[i].id === keyid) {
                    response.keys.splice(i, 1);
                    break;
                }
            }
            localDB.put(response)
            .then(function(resp){
                dfd.resolve(resp);
            }).catch(function(err){
                console.log(err);
            });
        }).catch(function(err){
            console.log(err);
        });
        EVEAPIHolder.delete(keyid);
        return dfd.promise;
    };
});
