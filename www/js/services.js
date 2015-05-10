'use strict';
angular.module('services', [])
.service('XML2JSON', function(x2js) {
    this.extractXML = function(xml){
        return x2js.xml_str2json(xml.data).eveapi.result;
    };
});
