
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
                    public memSeg: number,
                    public base: number,
                    public limit: number) {
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
} 