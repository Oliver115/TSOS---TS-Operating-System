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
        removeTarget(target) {
            var start_of_queue = this.simulatedReadyQueue[0];
            // Search for the target 
            for (let i = 0; i < this.simulatedReadyQueue.length; i++) {
                this.updateQueue();
                if (this.simulatedReadyQueue[0] == target) {
                    this.remove();
                    break;
                }
            }
            // Put the ready queue back as it was
            for (let k = 0; this.simulatedReadyQueue; k++) {
                if (this.simulatedReadyQueue[0] == start_of_queue) {
                    break;
                }
            }
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
        // Debug Purposes
        print() {
            console.log(this.simulatedReadyQueue);
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map