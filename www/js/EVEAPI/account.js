'use strict';
angular.module('compendium.account', [])
.factory('EVEAccount', function(CONFIG, $http, $q, XML2JSON, lodash, pouchDB) {
    var localDB = new pouchDB('compendium');
    var Account = function(name, key, code) {
        this.name = name;
        this.type = 'account';
        this._id = 'Account-' + key;
        this._rev = '';
        this.keyID = key;
        this.verificationCode = code;
        this.expires = '';
        this.accessMask = 0;
        this.status = 'None';
        this.characters = [];
    };
    Account.prototype.save = function() {
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
    Account.prototype.delete = function() {
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
    Account.prototype.serialize = function() {
        var serialObj = {};
        for (var property in this) {
            if (this.hasOwnProperty(property)) {
                serialObj[property] = this[property];
            }
        }
        return serialObj;
    };
    Account.prototype.refresh = function() {
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
