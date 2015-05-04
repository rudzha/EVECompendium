'use strict';
angular.module('compendium.skilltree', [])
.service('SkillTreeService', function($http, $q, CONFIG, XML2JSON, pouchDB, lodash) {
    var localDB = pouchDB('compendium');
    var self = this;
    this.synced = 0;
    this.skillTree = {};
    this.init = function () {
        var dfd = $q.defer();
        localDB.get('SkillTree').then(function(resp){
            console.log(resp.synced);
            self.skillTree = resp.skills;
            self.synced = resp.synced;
            dfd.resolve();
        }).catch(function(err){
            console.log(err);
            if(err.status === 404) {
                var skillTree = {
                    _id: 'SkillTree',
                    skills: {},
                    synced: 0
                };
                localDB.put(skillTree).then(function(response){
                    dfd.resolve(response);
                }).catch(function(error){
                    console.log(error);
                    dfd.reject(error);
                });
            }
        });
        return dfd.promise;
    };
    // TODO: Create and use date from user settings service
    this.isOutOfDate = function() {
        return ((lodash.now() - self.synced) >= 2629743);
    };
    this.getSkillTree = function(){
        return this.skillTree;
    };
    this.get = function(skillID) {
        return self.skillTree[skillID];
    };
    this.save = function() {
        var dfd = $q.defer();
        var now = lodash.now();
        localDB.get('SkillTree').then(function(resp){
            resp.synced = now;
            resp.skills = self.skillTree;
            return localDB.put(resp);
        }).then(function(resp){
            self.synced = now;
            dfd.resolve(resp);
        });
    };
    this.refresh = function () {
        var dfd = $q.defer();
        $http.get(CONFIG.APIPath + 'eve/skilltree.xml.aspx', {})
        .then(function(resp) {
            var data = XML2JSON.extractXML(resp);
            self.skillTree = lodash.chain(data.rowset.row)
            .transform(function(result, item) {
                var newitem = {
                    groupID: item._groupID,
                    groupName: item._groupName,
                    skills: lodash.isArray(item.rowset.row) ? item.rowset.row : [item.rowset.row]
                };
                result.push(newitem);
                return result;
            },[])
            .transform(function(result, item) {
                item.skills = lodash.transform(item.skills, function(result, skill) {
                    var newitem = {
                        groupID: item.groupID,
                        groupName: item.groupName,
                        skillID: skill._typeID,
                        skillName: skill._typeName,
                        description: skill.description,
                        rank: lodash.parseInt(skill.rank),
                        requiredAttributes: skill.requiredAttributes,
                        requiredSkills: lodash.isUndefined(skill.rowset[0].row) ? [] :
                                            lodash.isArray(skill.rowset[0].row) ? skill.rowset[0].row : [skill.rowset[0].row]
                    };
                    newitem.requiredSkills = lodash.transform(newitem.requiredSkills, function(result, reqSkill){
                        return result.push({skillID: reqSkill._typeID, level: lodash.parseInt(reqSkill._skillLevel)});
                    },[]);
                    return result.push(newitem);
                }, []);
                return result.push(item);
            },[])
            .transform(function(result, item) {
                var skills = lodash.indexBy(item.skills, 'skillID');
                return lodash.extend(result, skills);
            }, {})
            .value();
            dfd.resolve();
        }).catch(function(err) {
            dfd.reject(err);
            console.log('EVEAPI', err);
        });
        return dfd.promise;
    };
});
