var TSOS;
(function (TSOS) {
    class PCB {
        constructor(ID, PC, IR, Acc, Xreg, Yreg, Zflag, complete) {
            this.ID = ID;
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.complete = complete;
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
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map