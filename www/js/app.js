'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    'ionic',
    'starter.controllers',
    'starter.services',
    'starter.eveapi',
    'cb.x2js',
    'pouchdb'
    ])
.constant('CONFIG', {
    APIPath: 'https://api.eveonline.com/'
})
.run(function($ionicPlatform, EVEAPIHolder, APIKeyService) {
    $ionicPlatform.ready(function() {
        APIKeyService.init().then(function(resp){
            console.log(resp);
            return APIKeyService.listKeys();
        }).then(function(keys){
            for(var key in keys){
                EVEAPIHolder.add(keys[key]);
            }
            EVEAPIHolder.refresh();
            console.log('INIT', EVEAPIHolder);
        });
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.apikeys', {
        url: '/apikeys',
        views: {
            'menuContent': {
                templateUrl: 'templates/apikeys.html',
                controller: 'APIKeysCtrl'
            }
        },
        resolve: {
            keys: function(APIKeyService){
                return APIKeyService.listKeys();
            }
        }
    })
    .state('app.apikey', {
        url: '/apikeys/:keyId',
        views: {
            'menuContent': {
                templateUrl: 'templates/apikey.html',
                controller: 'APIKeyCtrl'
            }
        },
        resolve: {
            key: function(APIKeyService, $stateParams) {
                return APIKeyService.readKey($stateParams.keyId);
            }
        }
    })

    .state('app.characters', {
        url: '/characters',
        views: {
            'menuContent': {
                templateUrl: 'templates/characters.html',
                controller: 'CharactersCtrl'
            }
        }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/characters');
});
