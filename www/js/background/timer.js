(function () {
    'use strict';
    /**
     * @ngdoc service
     * @name Timer
     * @description
     *
     * Timer service, running at set intreval and executing registered
     * functions, methods, etc
     */
    function Timer($interval, lodash){
        console.log('Timer init');
        var self = this;
        this.minute = 60000;
        this.counter = 0;
        this.functionList = [];
        this.timer;
        this.checkTime = 0;
        /**
         * @ngdoc method
         * @name start
         * @description
         *
         * Takes and sets time in minutes, and starts the minute timer
         *
         * @param {number} Time in mintues
         */
        this.start = function(time) {
            console.log('Timer start', time);
            self.checkTime = time;
            self.timer = $interval(functionLoop, self.minute);
        };
        /**
         * @ngdoc method
         * @name stop
         * @description
         *
         * Checks if timer exists and stops it.
         */
        this.stop = function() {
            console.log('Timer stop');
            if(!lodash.isUndefined(self.timer)){
                $interval.cancel(self.timer);
            }
        };
        /**
         * @ngdoc method
         * @name update
         * @description
         *
         *	Updates time field.
         *
         * @param {number} time
         */
        this.update = function(time) {
            console.log('Timer updated');
            self.checkTime = time;
        };
        /**
         * @ngdoc method
         * @name registerFunction
         * @description
         *
         * Takes function or method and pushes it into an array
         *
         * @param {function} Function to register with the timer
         */
        this.registerFunction = function(regfn) {
            console.log('Timer register', regfn);
            self.functionList.push(regfn);
        };
        /**
         * @ngdoc function
         * @name functionLoop
         * @description
         *
         * Function that gets executed by the timer.
         * Every time it's executed it checks if enough time has passed for it
         * to call functions. If it has, function iterates trough the function
         * list and calls each.
         */
        function functionLoop() {
            self.counter++;
            console.log('Timer check', self.counter);
            if(self.counter >= self.checkTime) {
                lodash.forEach(self.functionList, function(item){
                    item();
                });
                self.counter = 0;
            }

        }
    }
    angular.module('compendium.background')
        .service('Timer', ['$interval', 'lodash', Timer]);
})();
