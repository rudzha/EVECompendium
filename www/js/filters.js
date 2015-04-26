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
});
