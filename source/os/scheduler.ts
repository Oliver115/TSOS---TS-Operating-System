/* ------------
   scheduler.ts
   ------------ */

module TSOS {
    export class Scheduler {

        quantum_count = 0;

        constructor() {
        }

        should_We_Context_Switch() {
            if (this.quantum_count == global_quantum) {
                return true;
            }
            else {
                return false;
            }
        }

        scheduleCount() {
            this.quantum_count += 1;
        }

        countReset() {
            this.quantum_count = 0;
        }
    }
}