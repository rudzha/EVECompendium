(function(){
    'use strict';
    function EVEMailboxes ($q, pouchDB, lodash, EVEMail, ObjectSerializer) {
        var localDB = new pouchDB('compendium');
        this.mailbox = {};
        this.outOfDate = false;
        this.init = function () {
            var self = this;
            var dfd = $q.defer();
            localDB.allDocs({include_docs: true, startkey: 'Mailbox-', endkey: 'Mailbox-\uffff'})
            .then(function(response){
                self.mailbox = lodash.transform(response.rows, function(result, item) {
                    result[item.doc.characterID] = lodash.create(EVEMail.prototype, item.doc);
                    return result;
                },{});
                console.log(self.mailbox);
                dfd.resolve(self);
            });
            return dfd.promise;
        };
        this.list = function() {
            var self = this;
            return lodash.transform(self.mailbox, function(result, mail){
                result.push(mail);
            }, []);
        };
        this.create = function(mailbox) {
            var self = this;
            mailbox._id = mailbox._id + mailbox.characterID;
            return localDB.put(ObjectSerializer.serialize(mailbox))
            .then(function(response){
                mailbox._rev = response.rev;
                self.mailbox[mailbox.characterID] = mailbox;
                return mailbox;
            })
            .catch(function(error) {
                return error;
            });
        };
        this.read = function(id) {
            var self = this;
            return self.mailbox[id];
        };
        this.update = function(mailbox) {
            console.log(mailbox);
            return localDB.put(ObjectSerializer.serialize(mailbox))
            .then(function(response){
                mailbox._rev = response.rev;
            })
            .catch(function(error){
                console.log(error);
                return error;
            });
        };
        this.delete = function(id) {
            var self = this;
            if(!lodash.isUndefined(self.mailbox[id])) {
                return localDB.get(self.mailbox[id]._id)
                .then(function(response) {
                    delete self.mailbox[id];
                    return localDB.remove(response);
                })
                .catch(function(error){
                    return error;
                });
            } else {
                return;
            }

        };
    }
    angular.module('compendium.characters')
        .service('EVEMailboxes', ['$q', 'pouchDB', 'lodash', 'EVEMail', 'ObjectSerializer', EVEMailboxes]);
})();
