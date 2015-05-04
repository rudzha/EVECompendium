'use strict';
// Ionic compendium App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'compendium' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'compendium.controllers' is found in controllers.js
angular.module('compendium', [
        'ionic',
        'compendium.controllers',
        'compendium.services',
        'compendium.apiholder',
        'compendium.account',
        'compendium.characters',
        'compendium.skillqueue',
        'compendium.skilltree',
        'compendium.filters',
        'ngLodash',
        'cb.x2js',
        'pouchdb'
    ])
    .constant('CONFIG', {
        APIPath: 'https://api.eveonline.com/'
    })
    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
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

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.transition('android');
    $stateProvider
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl',
            resolve: {
                user: function($q, UserService, ClockService) {
                    var dfd = $q.defer();
                    UserService.init().then(function() {
                        ClockService.start(UserService.syncRate);
                        dfd.resolve(UserService);
                    });
                    return dfd.promise;
                },
                eve: function($q, EVEAPIHolder, ClockService) {
                    var dfd = $q.defer();
                    EVEAPIHolder.init().then(function(response) {
                        console.log('INIT', response, EVEAPIHolder);
                        if (EVEAPIHolder.isOutOfDate()) {
                            console.log('INIT', 'Accounts out of date');
                            EVEAPIHolder.refresh().then(function() {
                                console.log('INIT', 'Accounts refreshed');
                                return EVEAPIHolder.updateCharacters();
                            }, function(error){
                                console.log(error);
                            }).then(function(){
                                console.log('INIT', 'Characters refreshed');
                                ClockService.addFunction(EVEAPIHolder.refresh);
                                dfd.resolve(EVEAPIHolder);
                            });
                        } else {
                            dfd.resolve(EVEAPIHolder);
                            console.log('INIT', 'Accounts up to date');
                        }
                    }, function(error){
                        console.log('INIT', error);
                        dfd.resolve(EVEAPIHolder);
                    });
                    return dfd.promise;
                },
                skills: function($q, SkillTreeService) {
                    var dfd = $q.defer();
                    SkillTreeService.init().then(function() {
                        if (SkillTreeService.isOutOfDate()) {
                            console.log('INIT', 'SkillTree out of date');
                            SkillTreeService.refresh().then(function() {
                                console.log('INIT', 'SkillTree refreshed');
                                SkillTreeService.save();
                                dfd.resolve(SkillTreeService);
                            });
                        } else {
                            console.log('INIT', 'SkillTree up to date');
                            dfd.resolve(SkillTreeService);
                        }
                    });
                    return dfd.promise;
                }
            }
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
        .state('app.skills', {
            url: '/skills',
            abstract: true,
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'templates/skills/skills.html',
                    controller: 'CharacterSkillsCtrl'
                }
            }
        })
        .state('app.skills.queue', {
            url: '/queue',
            views: {
                'queue': {
                    templateUrl: 'templates/skills/queue.html',
                    controller: 'SkillsQueueCtrl'
                }
            }
        })
        .state('app.skills.current', {
            url: '/current',
            views: {
                'current': {
                    templateUrl: 'templates/skills/current.html',
                    controller: 'SkillsCurrentCtrl'
                }
            }
        })
        .state('app.skills.all', {
            url: '/all',
            views: {
                'all': {
                    templateUrl: 'templates/skills/all.html',
                    controller: 'SkillsAllCtrl'
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
