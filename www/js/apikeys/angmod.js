(function () {
    'use strict';
    /**
     * @ngdoc object
     * @name compendium.apikeys
     * @description
     *
     * Module to contain all services required and used by
     * the api key management functionality of the application.
     */
    angular
        .module('compendium.apikeys', ['pouchdb', 'ngLodash', 'compendium.utilities', 'compendium.background']);
})();
