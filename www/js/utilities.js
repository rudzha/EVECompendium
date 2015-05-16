(function() {
    'use strict';
    function XML2JSON (x2js) {
        this.extractXML = function(xml) {
            return x2js.xml_str2json(xml.data).eveapi.result;
        };
    }
    function ObjectSerializer () {
        this.serialize = function(object) {
            return JSON.parse(JSON.stringify(object));
        };
    }
    angular
        .module('compendium.utilities', ['cb.x2js'])
            .service('XML2JSON', ['x2js', XML2JSON])
            .service('ObjectSerializer', [ObjectSerializer]);
})();
