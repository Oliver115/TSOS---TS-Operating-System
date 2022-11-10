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
                if (this.simulatedReadyQueue[0] == target) {
                    this.remove();
                    break;
                }
                else {
                    this.updateQueue();
                }
            }
            // Put the ready queue back as it was
            for (let k = 0; k < this.simulatedReadyQueue.length; k++) {
                if (this.simulatedReadyQueue[0] == start_of_queue) {
                    break;
                }
                else {
                    this.updateQueue();
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
        printlen() {
            console.log(this.simulatedReadyQueue.length);
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map