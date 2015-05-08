'use strict';
angular.module('compendium.plan', [])
.factory('SkillPlan', function($q, lodash, pouchDB) {
    var localDB = new pouchDB('compendium');
    var SkillPlan = function(id, obj) {
        this._id = 'Plan-'+ id;
        this._rev = '';
        this.name = obj.name;
        this.skillSeed = obj.skillSeed || {};
        this.generatedSkillPlan = [];
    };
    SkillPlan.prototype.save = function() {
        var self = this;
        var dfd = $q.defer();
        localDB.put(self.serialize()).then(function(response){
            console.log('SkillPlan:save', response);
            self._rev = response.rev;
            dfd.resolve(response);
        }).catch(function(error){
            console.log('SkillPlan:save',error);
            dfd.reject(error);
        });
        return dfd.promise;
    };
    SkillPlan.prototype.delete = function() {
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
    SkillPlan.prototype.serialize = function() {
        var serialObj = {};
        for (var property in this) {
            if (this.hasOwnProperty(property)) {
                serialObj[property] = this[property];
            }
        }
        return serialObj;
    };
    return SkillPlan;
});
