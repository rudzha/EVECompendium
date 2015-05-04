'use strict';
angular.module('compendium.filters', [])
.filter('GroupBy', function(lodash){
    return function(input, field) {
        //console.log(input, field);
        var grouped = lodash.chain(input)
        .transform(function(result, item) {
            result.push(item[field]);
            return result;
        },[])
        .sortBy()
        .uniq()
        .value();
        return grouped;
    };
}).filter('First', function(){
    return function(input) {
        return input && input.length && input[0] || '';
    };
}).filter('Last', function(){
    return function(input) {
        return input && input.length && input[input.length-1] || '';
    };
}).filter('TimeDifference', function(){
    return function(input, compareTo) {
        var diff = (input-compareTo) > 0 ? input-compareTo : compareTo-input;
        var years = Math.floor(diff/31556926000);
        diff -= years * 31556926000;
        var months = Math.floor(diff/2629743000);
        diff -= months * 2629743000;
        var days = Math.floor(diff/86400000);
        diff -= days * 86400000;
        var hours = Math.floor(diff/3600000);
        diff -= hours * 3600000;
        var minutes = Math.floor(diff/60000);
        diff -= minutes * 60000;
        return years + ' years ' + months + ' months ' +days+ ' days ' + hours + ' hours ' + minutes + ' minutes';
    };
});
