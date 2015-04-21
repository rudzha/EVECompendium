'use strict';
angular.module('starter.eveapi', [])
.service('EVEAPIHolder', function($q, EVEAPI){
    this.instances = {};
    this.add = function(key) {
        this.instances[key.id] = new EVEAPI(key.name, key.id, key.code);
    };
    this.get = function(keyID) {
        return this.instances[keyID];
    };
    this.delete = function(keyID) {
        delete this.instances[keyID];
    };
    this.list = function(){
        var dfd = $q.defer();
        var list = [];
        this.refresh();
        for(var key in this.instances) {
            list.push(key);
            //console.log(key);
        }
        dfd.resolve(list);
        return dfd.promise;
    };
    this.refresh = function() {
        for(var key in this.instances) {
            //console.log('refresh', key);
            this.instances[key].Account.refresh();
            this.instances[key].Characters.refresh();
            //console.log('EVEAPI Object', JSON.parse(JSON.stringify(this.instances[key])));
        }
    };
})
.factory('EVEAPI', function(CONFIG, $http, $q, x2js){
    var extractXML = function(xml){
        var json = x2js.xml_str2json(xml.data);
        return json.eveapi.result;
    };
    var EVEAPI = function (name, keyID, keyCode) {
        var self = this;
        this.name = name;
        this.keyID = keyID;
        this.keyCode = keyCode;
        this.keyStatus = 'NONE';
        this.Account = {
            keyInfo: {},
            characters: [],
            refresh: function() {
                $http.get(CONFIG.APIPath + 'account/apikeyinfo.xml.aspx', {
                    params: {
                        keyID: self.keyID,
                        vCode: self.keyCode
                    }
                }).then(function(resp) {
                    var data = extractXML(resp);
                    self.Account.keyInfo = {
                        expires: data.key._expires
                    };
                }).catch(function(err) {
                    //console.log('EVEAPI', err);
                    self.keyStatus = 'FAILED';
                });
                $http.get(CONFIG.APIPath + 'account/characters.xml.aspx', {
                        params: {
                            keyID: self.keyID,
                            vCode: self.keyCode
                        }
                }).then(function(resp){
                    var data = extractXML(resp);
                    if(Array.isArray(data.rowset.row)){
                        self.Account.characters = data.rowset.row;
                    } else {
                        self.Account.characters = [];
                        self.Account.characters.push(data.rowset.row);
                    }
                }).catch(function(err){
                        //console.log('EVEAPI', err);
                });
            }
        };
        this.Characters = {
            characters: {},
            refresh: function() {
                for(var char in self.Account.characters){
                    $http.get(CONFIG.APIPath + 'char/CharacterSheet.xml.aspx', {
                        params: {
                            keyID: self.keyID,
                            characterID: self.Account.characters[char]._characterID,
                            vCode: self.keyCode
                        }
                    }).then(function(resp){
                        //console.log(resp);
                        var data = extractXML(resp);
                        var character = {
                            name: data.name,
                            corporationName: data.corporationName,
                            allianceName: data.allianceName,
                            balance: data.balance,
                            skills: data.rowset[3]
                        };
                        self.Characters.characters[data.characterID] = character;
                    }).catch(function(err) {
                        //console.log('EVEAPI', err);
                    });
                }
            }
        };
    };
    return EVEAPI;
});
