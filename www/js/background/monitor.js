(function () {
    'use strict';
    /**
     * @ngdoc service
     * @name monitor.services:Monitor
     * @description
     *
     *
     */
    function Monitor(lodash,
                        APIKeys,
                        Characters,
                        Character,
                        SkillsCurrentAll,
                        SkillsCurrent,
                        SkillsQueues,
                        SkillsQueue,
                        TrainingPlans) {
        /**
         * @ngdoc function
         * @name refreshCharacters
         * @description
         *
         * Takes APIKey, iterates through it's characters, checking each if
         * Character object exists for it, creates object if needed and refreshes
         * @param {object} APIKey
         * @return {object} Promise containing refresh response
         */
        function refreshCharacters(key) {
            lodash.forEach(key.characters, function(char) {
                if (lodash.isUndefined(Characters.read(char))) {
                    var temp = new Character();
                    temp.characterID = char;
                    temp.refresh(key.keyID, key.verificationCode)
                    .then(function(){
                        return Characters.create(temp);
                    });
                } else {
                    var tempChar = Characters.read(char);
                    return tempChar.refresh(key.keyID, key.verificationCode)
                    .then(function(response){
                        return Characters.update(tempChar);
                    });
                }
            });
        }
        /**
         * @ngdoc function
         * @name refreshSkillsCurrent
         * @description
         *
         * Takes APIKey, iterates through it's characters, checking if each has
         * a SkillsCurrent object, creates object if needed and refreshes
         * @param {object} APIKey
         * @return {object} Promise containing refresh response
         */
        function refreshSkillsCurrent(key) {
            lodash.forEach(key.characters, function(char) {
                if (lodash.isUndefined(SkillsCurrentAll.read(char))) {
                    var temp = new SkillsCurrent();
                    temp.characterID = char;
                    temp.refresh(key.keyID, key.verificationCode)
                    .then(function(){
                        return SkillsCurrentAll.create(temp);
                    });
                } else {
                    var tempChar = SkillsCurrentAll.read(char);
                    return tempChar.refresh(key.keyID, key.verificationCode)
                    .then(function(response){
                        return SkillsCurrentAll.update(tempChar);
                    });
                }
            });
        }
        /**
         * @ngdoc function
         * @name refreshSKillsQueue
         * @description
         *
         * Takes APIKey, iterates through it's characters, checking if each has
         * a SkillsQueue object, creates object if needed and refreshes
         * @param {object} APIKey
         * @return {object} Promise containing refresh response
         */
        function refreshSkillsQueue(key) {
            lodash.forEach(key.characters, function(char) {
                if (lodash.isUndefined(SkillsQueues.read(char))) {
                    var temp = new SkillsQueue();
                    temp.characterID = char;
                    temp.refresh(key.keyID, key.verificationCode)
                    .then(function(){
                        return SkillsQueues.create(temp);
                    });
                } else {
                    var tempChar = SkillsQueues.read(char);
                    return tempChar.refresh(key.keyID, key.verificationCode)
                    .then(function(response){
                        return SkillsQueues.update(tempChar);
                    });
                }
            });
        }
        function refreshTrainingPlans() {
            lodash.forEach(TrainingPlans.list(), function(item) {
                item.generate();
            });
        }
        /**
         * @ngdoc method
         * @name refresh
         * @description
         *
         * Iterates over APIKeys, refreshin each and it's related Characters
         */
        this.refresh = function() {
            var self = this;
            var apikeys = APIKeys.list();
            lodash.forEach(apikeys, function(key) {
                key.refresh().then(function() {
                    refreshCharacters(key);
                    refreshSkillsCurrent(key);
                    refreshSkillsQueue(key);
                    refreshTrainingPlans();
                });
                APIKeys.update(key);
            });
        };
    }
    angular
        .module('compendium.background')
            .service('Monitor', ['lodash',
                                    'APIKeys',
                                    'Characters',
                                    'Character',
                                    'SkillsCurrentAll',
                                    'SkillsCurrent',
                                    'SkillsQueues',
                                    'SkillsQueue',
                                    'TrainingPlans',
                                    Monitor]);
})();
