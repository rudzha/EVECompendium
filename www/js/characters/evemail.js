(function(){
    'use strict';
    function EVEMail(CONFIG, $q, $http, lodash, XML2JSON) {
        var eveMail = function() {
            this._id = 'Mailbox-';
            this._rev = '';
            this.characterID = '';
            this.mailheader = [];
            this.mailbody = {};
        };
        eveMail.prototype.refresh = function(keyID, vCode) {
            var dfd = $q.defer();
            var self = this;
            $http.get(CONFIG.APIPath + 'char/MailMessages.xml.aspx', {
                params: {
                    keyID: keyID,
                    characterID: self.characterID,
                    vCode: vCode
                }
            }).then(function(resp) {
                var data = XML2JSON.extractXML(resp);
                if(data.rowset.row) {
                    var newmail = lodash.map(data.rowset.row, function(item) {
                        var mail = {
                            messageID: item._messageID,
                            senderID: item._senderID,
                            senderName: item._senderName,
                            sentDate: new Date(item._sentDate.replace(/-/g, '/')).valueOf(),
                            title: item._title,
                            read: false
                        };
                        return mail;
                    });
                    self.mailheader = self.mailheader.concat(newmail);
                    self.mailheader = lodash.uniq(self.mailheader, function(item) {
                        return item.messageID;
                    });

                    var newBodyIDList = lodash.transform(self.mailheader, function(result, item) {
                        if(lodash.isUndefined(self.mailbody[item.messageID])) {
                            result.push(item.messageID);
                        }
                    });
                    if(newBodyIDList.length) {
                        $http.get(CONFIG.APIPath + 'char/MailBodies.xml.aspx', {
                            params: {
                                keyID: keyID,
                                characterID: self.characterID,
                                vCode: vCode,
                                ids: newBodyIDList
                            }
                        }).then(function(resp){
                            var data = XML2JSON.extractXML(resp);
                            lodash.forEach(data.rowset.row, function(item) {
                                self.mailbody[item._messageID] = item.__cdata;
                            });
                            dfd.resolve(self);
                        });
                    }
                }
            });
            return dfd.promise;
        };
        return eveMail;
    }
    angular
        .module('compendium.characters')
            .factory('EVEMail', ['CONFIG', '$q', '$http', 'lodash', 'XML2JSON', EVEMail]);
})();
