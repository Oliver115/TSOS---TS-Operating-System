/* ------------
   dispatcher.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class Dispatcher {
        constructor() {
            this.simulatedReadyQueue = [];
        }
        createQueue(id) {
            this.simulatedReadyQueue.push(id);
        }
        updateQueue() {
            var change = this.simulatedReadyQueue.shift();
            this.simulatedReadyQueue.push(change);
        }
        remove() {
            this.simulatedReadyQueue.shift();
        }
        next() {
            return this.simulatedReadyQueue[0];
        }
        is_empty() {
            if (this.simulatedReadyQueue.length == 0) {
                return true;
            }
            else {
                return false;
            }
        }
        print() {
            console.log(this.simulatedReadyQueue);
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map