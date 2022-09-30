
module TSOS {
    export class PCB {

        constructor(public ID: number,
                    public PC: number,
                    public IR: number,
                    public Acc: number,
                    public Xreg: number,
                    public Yreg: number,
                    public Zflag: number,
                    public step: number) {
        }

        get_ID() {
            return this.ID;
        }
    } 


} 