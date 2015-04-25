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
    'starter.skilltree',
    'ngLodash',
    'cb.x2js',
    'pouchdb'
    ])
.constant('CONFIG', {
    APIPath: 'https://api.eveonline.com/'
})
.run(function($ionicPlatform, UserService, EVEAPIHolder, SkillTreeService, ClockService) {
    $ionicPlatform.ready(function() {
        UserService.init().then(function() {
            console.log('INIT', 'User Settings Loaded');
            var logp = function() {
                console.log('Penis');
            };
            ClockService.start(UserService.syncRate);
        });
        SkillTreeService.init().then(function() {
            if(SkillTreeService.isOutOfDate()){
                console.log('INIT', 'SkillTree out of date');
                SkillTreeService.refresh().then(function(){
                    console.log('INIT', 'SkillTree refreshed');
                    SkillTreeService.save();
                });
            } else {
                console.log('INIT', 'SkillTree up to date');
            }
        });
        EVEAPIHolder.init().then(function(){
            console.log(EVEAPIHolder);
            if(EVEAPIHolder.isOutOfDate()){
                console.log('INIT', 'Accounts out of date');
                EVEAPIHolder.refresh().then(function(){
                    console.log('INIT', 'Accounts refreshed');
                    EVEAPIHolder.save();
                    ClockService.addFunction(EVEAPIHolder.refresh);
                });
            } else {
                console.log('INIT', 'Accounts up to date');
            }
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
        }
    })
    .state('app.apikey', {
        url: '/apikeys/:keyID',
        views: {
            'menuContent': {
                templateUrl: 'templates/apikey.html',
                controller: 'APIKeyCtrl'
            }
        },
        resolve: {
            keyID: function($stateParams) {
                return $stateParams.keyID;
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
    })

    .state('app.character', {
        url: '/characters/:characterID',
        views: {
            'menuContent': {
                templateUrl: 'templates/charactersheet.html',
                controller: 'CharacterSheetCtrl'
            }
        },
        resolve: {
            characterID: function($stateParams) {
                return $stateParams.characterID;
            }
        }
    })
    .state('app.characterskills', {
        url: '/skills/:characterID',
        views: {
            'menuContent': {
                templateUrl: 'templates/skills.html',
                controller: 'CharacterSkillsCtrl'
            }
        },
        resolve: {
            characterID: function($stateParams) {
                return $stateParams.characterID;
            },
            skills: function($q, $stateParams, EVEAPIHolder, $timeout){
                var dfd = $q.defer();
                $timeout(function(){
                    console.log('Fail');
                    if(typeof EVEAPIHolder.characters[$stateParams.characterID] !== 'undefined'){
                        if(typeof EVEAPIHolder.characters[$stateParams.characterID] !== 'undefined'){
                            dfd.resolve();
                        }
                    }
                }, 100);
                return dfd.promise;
            }
        }
    })
    .state('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsCtrl'
            }
        }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/characters');
});
