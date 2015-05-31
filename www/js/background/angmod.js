(function () {
    'use strict';
    /**
     * @ngdoc object
     * @name compendium.background
     * @description
     *
     * Module containing services required for background mode and notifications
     */
    angular
        .module('compendium.background', ['pouchdb',
                                            'ngLodash',
                                            'compendium.apikeys',
                                            'compendium.characters',
                                            'compendium.training',
                                            'compendium.utilities']);
})();
