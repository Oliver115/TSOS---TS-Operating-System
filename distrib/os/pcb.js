var TSOS;
(function (TSOS) {
    class PCB {
        constructor(ID, PC, IR, Acc, Xreg, Yreg, Zflag, complete, state, memSeg, base, limit, priority) {
            this.ID = ID;
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.complete = complete;
            this.state = state;
            this.memSeg = memSeg;
            this.base = base;
            this.limit = limit;
            this.priority = priority;
        }
        done() { this.complete = true; }
        // Getters 
        get_ID() { return this.ID; }
        get_PC() { return this.PC; }
        get_IR() { return this.IR; }
        get_Acc() { return this.Acc; }
        get_Xreg() { return this.Xreg; }
        get_Yreg() { return this.Yreg; }
        get_Zflag() { return this.Zflag; }
        get_stat() { return this.complete; }
        get_state() { return this.state; }
        get_memSeg() { return this.memSeg; }
        get_base() { return this.base; }
        get_limit() { return this.limit; }
        get_priority() { return this.priority; }
        // Setters
        set_ID(newID) { this.ID = newID; }
        set_PC(newPC) { this.PC = newPC; }
        set_IR(newIR) { this.IR = newIR; }
        set_Acc(newAcc) { this.Acc = newAcc; }
        set_Xreg(newX) { this.Xreg = newX; }
        set_Yreg(newY) { this.Yreg = newY; }
        set_Zflag(newZflag) { this.Zflag = newZflag; }
        set_state(state) { this.state = state; }
        set_memSeg(newMemSeg) { this.memSeg = newMemSeg; }
        set_base(newBase) { this.base = newBase; }
        set_limit(newLimit) { this.limit = newLimit; }
        set_priority(newP) { this.priority = newP; }
        // Turnaround and Wait Time trackers
        update_time() {
            if (this.state === "Running...") {
                if (this.ID == 0) {
                    global_times[0] = global_times[0] + 1;
                }
                else {
                    global_times[(this.ID * 2)] = global_times[(this.ID * 2)] + 1;
                }
            }
            else if (this.state === "Ready") {
                if (this.ID == 0) {
                    global_times[0] = global_times[0] + 1;
                    global_times[1] = global_times[1] + 1;
                }
                else {
                    global_times[(this.ID * 2)] = global_times[(this.ID * 2)] + 1;
                    global_times[(this.ID * 2) + 1] = global_times[(this.ID * 2) + 1] + 1;
                }
            }
        }
        createEntry() {
            global_times.push(0);
            global_times.push(0);
        }
        get_turn() {
            if (this.ID == 0) {
                return global_times[0];
            }
            else {
                return global_times[(this.ID * 2)];
            }
        }
        get_wait() {
            if (this.ID == 0) {
                return global_times[1];
            }
            else {
                return global_times[(this.ID * 2) + 1];
            }
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map