
module TSOS {
    export class PCB {

        constructor(public ID: number,
                    public PC: number,
                    public IR: number,
                    public Acc: number,
                    public Xreg: number,
                    public Yreg: number,
                    public Zflag: number,
                    public complete: boolean,
                    public state: string,
                    public memSeg: number,
                    public base: number,
                    public limit: number, 
                    public priority: number) {
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
        set_ID(newID: number) { this.ID = newID; }
        set_PC(newPC: number) { this.PC = newPC; }
        set_IR(newIR: number) { this.IR = newIR; }
        set_Acc(newAcc: number) { this.Acc = newAcc; }
        set_Xreg(newX: number) { this.Xreg = newX; }
        set_Yreg(newY: number) { this.Yreg = newY; }
        set_Zflag(newZflag: number) { this.Zflag = newZflag; }
        set_state(state: string) { this.state = state; }
        set_memSeg(newMemSeg: number) { this.memSeg = newMemSeg; }
        set_base(newBase: number) { this.base = newBase; }
        set_limit(newLimit: number) { this.limit = newLimit; }
        set_priority(newP: number) { this.priority = newP; }
    } 
} 