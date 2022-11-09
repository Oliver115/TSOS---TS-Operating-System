/* ------------
   scheduler.ts
   ------------ */
var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor() {
            this.quantum_count = 0;
        }
        should_We_Context_Switch() {
            if (this.quantum_count >= global_quantum) {
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
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map