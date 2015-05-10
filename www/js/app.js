'use strict';
/**
 * @ngdoc object
 * @name compendium
 * @description
 *
 * EVE Compendium application.
 */
angular.module('compendium', [
    'ionic',
    'ngLodash',
    'cb.x2js',
    'pouchdb',

    'controllers',
    'services',
    'apiholder',
    'account',
    'characters',
    'skillqueue',
    'skilltree',
    'compendium.background',
    'compendium.plan',
    'compendium.settings',
    'filters'
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
            cordova.plugins.backgroundMode.enable();
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

    });
})
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $stateProvider
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl',
            resolve: {
                settings: function(Settings) {
                    return Settings.init();
                },
                eve: function($q, EVEAPIHolder, Timer) {
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
                                Timer.registerFunction(EVEAPIHolder.refresh);
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
                    templateUrl: 'templates/apikeys/apikeys.html',
                    controller: 'APIKeysCtrl'
                }
            }
        })
        .state('app.apikey', {
            url: '/apikeys/:keyID',
            views: {
                'menuContent': {
                    templateUrl: 'templates/apikeys/apikey.html',
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
                    controller: 'CharactersCtrl',
                    controllerAs: 'vm'
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
            }
        })
        .state('app.skills', {
            url: '/skills',
            abstract: true,
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: 'templates/skills/skills.html',
                    controller: 'CharacterSkillsCtrl'
                }
            }
        })
        .state('app.skills.queue', {
            url: '/queue',
            cache: false,
            views: {
                'queue': {
                    templateUrl: 'templates/skills/queue.html',
                    controller: 'SkillsQueueCtrl'
                }
            }
        })
        .state('app.skills.current', {
            url: '/current',
            cache: false,
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
        .state('app.plans', {
            url: '/plans',
            abstract: true,
            views: {
                'menuContent': {
                    templateUrl: 'templates/planner/plans.html',
                }
            },
            resolve: {
                skillPlans: function(SkillPlans) {
                    return SkillPlans.init().then(function(){
                        return SkillPlans;
                    });
                }
            }
        })
        .state('app.plans.new', {
            url: '/new',
            views: {
                'plansview': {
                    templateUrl: 'templates/planner/planeditor.html',
                    controller: 'PlansEditorCtrl'
                }
            }
        })
        .state('app.plans.list', {
            url: '',
            views: {
                'plansview': {
                    templateUrl: 'templates/planner/planlist.html',
                    controller: 'PlansCtrl'
                }
            }
        })
        .state('app.plans.selected', {
            url: '/:id',
            views: {
                'plansview': {
                    templateUrl: 'templates/planner/plan.html',
                    controller: 'PlanCtrl'
                }
            }
        })
        .state('app.plans.edit', {
            url: '/:id/edit',
            views: {
                'plansview': {
                    templateUrl: 'templates/planner/planeditor.html',
                    controller: 'PlansEditorCtrl'
                }
            }
        })
        .state('app.settings', {
            url: '/settings',
            views: {
                'menuContent': {
                    templateUrl: 'templates/settings/settings.html',
                    controller: 'SettingsCtrl'
                }
            }
        });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/characters');
});
