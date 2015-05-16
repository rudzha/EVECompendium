(function () {
    'use strict';
    /**
     * @ngdoc object
     * @name compendium.characters
     * @description
     *
     * Module to contain all services required and used by
     * the character management functionality of the application.
     */
    angular
        .module('compendium.characters', ['pouchdb', 'ngLodash', 'compendium.utilities', 'compendium.settings']);
})();
