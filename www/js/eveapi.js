angular.module('starter.eveapi', [])
.service('EveAPIXMLExtractor', function(x2js){
    var eveAPIXMLExtractor = {
        getData: function(xml) {
            var temp = x2js.xml_str2json(xml.data);
            var json = temp.eveapi.result;
            return json;
        }
    };
    return eveAPIXMLExtractor;
})
.factory('EVEAPI', function(CONFIG, $http, $q, EveAPIXMLExtractor){
    var EVEAPI = function (keyID, keyCode) {
        var self = this;
        this.keyID = keyID;
        this.keyCode = keyCode;
        this.Account = {
            keyInfo: null,
            characters: null,
            refreshKey: function() {
                var dfd = $q.defer();
                $http.get(CONFIG.APIPath + 'account/apikeyinfo.xml.aspx', {
                        params: {
                            keyID: self.keyID,
                            vCode: self.keyCode
                        }
                    }).then(function(resp){
                        console.log('EVEAPI', resp);
                        temp = EveAPIXMLExtractor.getData(resp).key;
                        self.Account.keyInfo = temp;
                        dfd.resolve(temp);
                    }).catch(function(err){
                        console.log('EVEAPI', err);
                        dfd.reject(err);
                    });
                return dfd.promise;
            }
        };
    };
    return EVEAPI;
});
