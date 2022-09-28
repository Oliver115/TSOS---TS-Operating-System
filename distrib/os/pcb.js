var TSOS;
(function (TSOS) {
    class PCB {
        constructor(ID, PC, IR, Acc, Xreg, Yreg, Zflag, step) {
            this.ID = ID;
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.step = step;
        }
        get_ID() {
            return this.ID;
        }
    }
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map