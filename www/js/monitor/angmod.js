(function () {
    'use strict';
    /**
     * @ngdoc object
     * @name compendium.monitor
     * @description
     *
     * Services to monitor and refresh API data.
     */
    angular
        .module('compendium.monitor', ['pouchdb',
                                        'ngLodash',
                                        'compendium.apikeys',
                                        'compendium.characters',
                                        'compendium.utilities']);
})();
