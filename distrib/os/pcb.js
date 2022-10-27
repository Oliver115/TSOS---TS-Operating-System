var TSOS;
(function (TSOS) {
    class PCB {
        constructor(ID, PC, IR, Acc, Xreg, Yreg, Zflag, complete, memSeg, base, limit) {
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
        }
        get_ID() { return this.ID; }
        get_PC() { return this.PC; }
        get_IR() { return this.IR; }
        get_Acc() { return this.Acc; }
        get_Xreg() { return this.Xreg; }
        get_Yreg() { return this.Yreg; }
        get_Zflag() { return this.Zflag; }
        get_stat() { return this.complete; }
        done() { this.complete = true; }
        get_memSeg() { return this.memSeg; }
        get_base() { return this.base; }
        get_limit() { return this.limit; }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map