/* ------------
   dispatcher.ts
   ------------ */

module TSOS {
    export class Dispatcher {

        simulatedReadyQueue = [];

        constructor() {
        }

        createQueue(id: number) {
            this.simulatedReadyQueue.push(id);
        }

        updateQueue() {
            var change = this.simulatedReadyQueue.shift();
            this.simulatedReadyQueue.push(change);
        }

        remove() {
            this.simulatedReadyQueue.shift();
        }


        removeTarget(target: number) {
            var start_of_queue = this.simulatedReadyQueue[0];

            // Search for the target 
            for(let i = 0; i < this.simulatedReadyQueue.length; i++) {
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
}