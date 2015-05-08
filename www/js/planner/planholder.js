'use strict';
angular.module('compendium.planholder', [])
.service('SkillPlans', function($q, SkillPlan, pouchDB, lodash) {
    var localDB = new pouchDB('compendium');
    this.skillPlans = {};
    this.init = function () {
        var self = this;
        var promises = [];
        var plans = localDB.allDocs({include_docs: true, startkey: 'Plan-', endkey: 'Plan-\uffff'}).then(function(response){
            self.skillPlans = lodash.transform(response.rows, function(result, item) {
                console.log(item);
                result[item.id] = lodash.create(SkillPlan.prototype, item.doc);
                return result;
            },{});
            return response;
        });
        promises.push(plans);
        return $q.all(promises);
    };
    this.create = function(plan) {
        var self = this;
        var id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        var temp = new SkillPlan(id, plan);
        return temp.save().then(function(response){
            self.skillPlans['Plan-'+id] = temp;
            console.log(self.skillPlans);
        });
    };
    this.read = function(id) {
        var self = this;
        return self.skillPlans[id];
    };
    this.remove = function(id) {
        var self = this;
        return self.skillPlans[id].delete().then(function(){
            delete self.skillPlans[id];
        });
    };
});
