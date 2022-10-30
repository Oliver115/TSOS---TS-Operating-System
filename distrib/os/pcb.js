var TSOS;
(function (TSOS) {
    class PCB {
        constructor(ID, PC, IR, Acc, Xreg, Yreg, Zflag, complete, memSeg, base, limit, priority) {
            this.ID = ID;
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.complete = complete;
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
        set_memSeg(newMemSeg) { this.memSeg = newMemSeg; }
        set_base(newBase) { this.base = newBase; }
        set_limit(newLimit) { this.limit = newLimit; }
        set_priority(newP) { this.priority = newP; }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map