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
    'compendium.apikeys',
    'compendium.background',
    'compendium.characters',
    'compendium.plan',
    'compendium.skilltree',
    'compendium.settings',
    'compendium.training',
    'compendium.utilities',
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
                apikeys: function(APIKeys) {
                    return APIKeys.init();
                },
                characters: function(Characters) {
                    return Characters.init();
                },
                skillscurrent: function(SkillsCurrentAll) {
                    return SkillsCurrentAll.init();
                },
                skillsqueue: function(SkillsQueues) {
                    return SkillsQueues.init();
                },
                skilltree: function($q, SkillTree) {
                    var dfd = $q.defer();
                    SkillTree.init().then(function() {
                        if (SkillTree.isOutOfDate()) {
                            console.log('INIT', 'SkillTree out of date');
                            SkillTree.refresh().then(function() {
                                console.log('INIT', 'SkillTree refreshed');
                                SkillTree.save();
                                dfd.resolve(SkillTree);
                            });
                        } else {
                            console.log('INIT', 'SkillTree up to date');
                            dfd.resolve(SkillTree);
                        }
                    });
                    return dfd.promise;
                },
                skillPlans: function(SkillPlans) {
                    return SkillPlans.init();
                },
                trainingPlans: function(TrainingPlans) {
                    return TrainingPlans.init();
                }
            }
        })
        .state('app.apikeys', {
            url: '/apikeys',
            abstract: true,
            views : {
                'menuContent': {
                    templateUrl: 'templates/apikeys/apikeys.html'
                }
            }
        })
        .state('app.apikeys.list', {
            url: '',
            views: {
                'apikeysview': {
                    templateUrl: 'templates/apikeys/apikeyslist.html',
                    controller: 'APIKeysListCtrl'
                }
            }
        })
        .state('app.apikeys.selected', {
            url: '/:id',
            views: {
                'apikeysview': {
                    templateUrl: 'templates/apikeys/apikeyselected.html',
                    controller: 'APIKeysSelectedCtrl'
                }
            }
        })
        .state('app.apikeys.new', {
            url: '/new',
            views: {
                'apikeysview': {
                    templateUrl: 'templates/apikeys/apikeysnew.html',
                    controller: 'APIKeysNewCtrl'
                }
            }
        })
        .state('app.characters', {
            url: '/characters',
            views: {
                'menuContent': {
                    templateUrl: 'templates/characters/characters.html',
                    controller: 'CharactersCtrl'
                }
            }
        })
        .state('app.charactersheet', {
            url: '/characters/:id',
            views: {
                'menuContent': {
                    templateUrl: 'templates/characters/charactersheet.html',
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
            url: '/queue/:id',
            cache: false,
            views: {
                'queue': {
                    templateUrl: 'templates/skills/queue.html',
                    controller: 'SkillsQueueCtrl'
                }
            }
        })
        .state('app.skills.current', {
            url: '/current/:id',
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
        .state('app.training', {
            url: '/training',
            abstract: true,
            views: {
                'menuContent': {
                    templateUrl: 'templates/training/training.html'
                }
            }
        })
        .state('app.training.list', {
            url: '',
            views: {
                'trainingview': {
                    templateUrl: 'templates/training/traininglist.html',
                    controller: 'TrainingListCtrl'
                }
            }
        })
        .state('app.training.new', {
            url: '/new',
            views: {
                'trainingview': {
                    templateUrl: 'templates/training/trainingnew.html',
                    controller: 'TrainingNewCtrl'
                }
            }
        })
        .state('app.training.selected', {
            url: '/:id',
            views: {
                'trainingview': {
                    templateUrl: 'templates/training/trainingselected.html',
                    controller: 'TrainingSelectedCtrl'
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
