angular.module('starter.services', [])
.service('APIKeyService', function(EVEAPI, $q){
    var apiKeyService = {};
    apiKeyService.listKeys = function (){
        var dfd = $q.defer();
        localDB.get('APIKeys')
        .then(function(response){
            dfd.resolve(response.keys);
        })
        .catch(function(err){
            console.log('APIKeyService', err);
        });
        return dfd.promise;
    };
    apiKeyService.createKey = function(key){
        var eveAPI = new EVEAPI(key.id, key.code);
        eveAPI.Account.refreshKey().then(function(response){
            if(typeof(eveAPI.Account.keyInfo) !== 'undefined') {
                key.expires = eveAPI.Account.keyInfo._expires;
                localDB.get('APIKeys')
                .then(function(response){
                    var apikeys = response;
                    apikeys.keys.push(key);
                    localDB.put(apikeys).then(function(response){
                        console.log('APIKeyService', response);
                    }).catch(function(err){
                        console.log('APIKeyService', err);
                    });
                })
                .catch(function(err){
                    console.log('APIKeyService', err);
                });
            }
        }).catch(function(err){
            console.log('APIKeyService', err);
        });

    };
    apiKeyService.readKey = function (keyid) {
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
    apiKeyService.deleteKey = function (keyid) {
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
        return dfd.promise;
    };
    return apiKeyService;
});
