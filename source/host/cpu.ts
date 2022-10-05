/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        // include current memory location (iP3)
        constructor(public PC: number = 0,
                    public IR: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public little_endian: number = 0x0000,
                    public isExecuting: boolean = false) {
        }

        public init(): void {
            this.PC = 0;
            this.IR = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.little_endian = 0x0000;
            this.isExecuting = false;
        }

        
        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');

            if (_PCBprogram[2] == 0) {
                for(let i = 0; i < _PCBs.length; i++) {
                    var temp_pcb: PCB; temp_pcb = _PCBs[i];
                    if (temp_pcb.get_ID() == _PCBprogram[0]) {
                        this.PC = temp_pcb.get_PC();
                        this.IR = temp_pcb.get_IR();
                        this.Acc = temp_pcb.get_Acc();
                        this.Xreg = temp_pcb.get_Xreg();
                        this.Yreg = temp_pcb.get_Yreg();
                        this.Zflag = temp_pcb.get_Zflag();
                        _PCBprogram[2] = 1;
                        break;
                    }
                }
            }

            // Fetch-Decode-Execute Cycle in ONE CPU cycle
            this.fetch();
            this.decode();
            this.execute();
        }

        /**
         * Method that uses the MemoryAccessor to place the Program Counter into the MAR
         * At the end, it changes the current state to 1
         */
        fetch() { // 0
            _MemoryAccessor.readMMU(this.PC);
        }

        /**
         * Method that uses the MemoryAccessor to get the MDR's value and puts it into the Instruction Register
         * At the end, it changes the current state to 3
         * @param accessor = MemoryAccessor that is connected to the CPU 
         */
        decode() { // 1
            this.IR = _MemoryAccessor.getMDR_MMU();
            console.log("Decode: " + this.hexLog(_MemoryAccessor.getMDR_MMU(), 2));
        } 

        /**
         * Method that looks at the Instruction Register and executes the instruction based on the value in the IR
         * At the end, it changes the current state to either 5 or 6
         * @param accessor = MemoryAccessor that is connected to the CPU 
         * @var temp_PC = variable used for temporarily saving the Program Counter while the CPU uses the Program Counter to communicate back and fourth with the MemoryAccessor
         */
        execute() { // 3
            switch(this.hexLog(this.IR, 2)) {

                // Load the accumulator with a constant
                case "A9": 
                    this.PC++;
                    this.fetch();
                    this.Acc = _MemoryAccessor.getMDR_MMU();
                    this.viewProgram();
                    this.PC++;
                    break;

                // Load the accumulator from accessor
                case "AD": 
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);

                    var temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch();
                    this.Acc = _MemoryAccessor.getMDR_MMU();

                    this.PC = temp_PC;
                    this.viewProgram();
                    this.PC++;
                    break;

                // Store the accumulator in accessor
                case "8D":
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());

                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);

                    this.writeBack();
                    this.viewProgram();
                    this.PC++;
                    break;

                // Add contents of an address to the accumulator and keeps the result in the accumulator
                case "6D": 
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch();
                    this.Acc = (this.Acc + _MemoryAccessor.getMDR_MMU());

                    this.PC = temp_PC;

                    this.viewProgram();
                    this.PC++;
                    break;

                // Load the Xreg register with a constant
                case "A2": 
                    this.PC++;
                    this.fetch();
                    this.Xreg = _MemoryAccessor.getMDR_MMU();

                    this.viewProgram();
                    this.PC++;
                    break;

                // Load the Xreg register from accessor
                case "AE": 
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch();
                    this.Xreg = _MemoryAccessor.getMDR_MMU();

                    this.PC = temp_PC;
                    this.viewProgram();
                    this.PC++;
                    break;

                // Load the Y register with a constant
                case "A0": 
                    this.PC++;
                    this.fetch();
                    this.Yreg = _MemoryAccessor.getMDR_MMU();

                    this.viewProgram();
                    this.PC++;
                    break;

                // Load the Y register from accessor
                case "AC": 
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch();
                    this.Yreg = _MemoryAccessor.getMDR_MMU();

                    this.PC = temp_PC;
                    this.viewProgram();
                    this.PC++;
                    break;

                // No operation
                case "EA": 
                    this.viewProgram();
                    this.PC++;
                    break;

                // Break - Stop System
                case "00": 
                    console.log("END")
                    _PCBprogram[1] = false; // CPU is done with the program
                    _PCBprogram[2] = 0; // Set PCB setter to 0
                    break;

                // Compare a byte in accessor to the Xreg register. Sets the Zflag to zero (0) if the byte in accessor and the Xreg register are equal
                case "EC": 
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.PC = this.little_endian;
                    this.fetch();

                    if (_MemoryAccessor.getMDR_MMU() == this.Xreg) {
                        this.Zflag = 0;
                        this.PC = temp_PC;
                        this.viewProgram();
                        this.PC++;
                    }
                    else {
                        this.Zflag = 1;
                        this.PC = temp_PC;
                        this.viewProgram();
                        this.PC++;
                    }
                    break;

                // Branch n bytes if Zflag is set to zero (0) 
                case "D0": 
                    if (this.Zflag == 0) {
                        this.PC++;
                        this.fetch();
                        var branch = (this.howMuchBranch(_MemoryAccessor.getMDR_MMU())); 

                        this.PC = this.PC + branch;
                        this.viewProgram();
                    }
                    else {
                        this.PC++;
                        this.viewProgram();
                    }
                    break;

                // Increment the value of a byte
                case "EE": 
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch();
                    var tempAcc = this.Acc;
                    this.Acc = (_MemoryAccessor.getMDR_MMU() + 0x01);

                    this.writeBack();

                    this.Acc = tempAcc;
                    this.PC = temp_PC;
                    this.viewProgram();
                    this.PC++;
                    break;

                // System Calls - 
                case "FF": 
                    if (this.Xreg == 0x01) { // If there is a 0x01 in the Xreg register. Print the integer in the Y register
                        _StdOut.putText(String(this.Yreg));
                        this.viewProgram();
                        this.PC++;
                        break;
                    }
                    else {
                        this.viewProgram();
                    }

                    if (this.Xreg == 0x02) { // If there is a 0x02 in the Xreg register. Print the 0x00 terminated string stored at address in the Y register
                        temp_PC = this.PC;
                        this.PC = _MemoryAccessor.setLowOrderByte(this.Yreg);

                        var continueString = 1;
                        while(continueString == 1) {

                            this.fetch();

                            if (_MemoryAccessor.getMDR_MMU() == 0x00) {
                                this.PC = temp_PC + 1;
                                continueString = 0;
                                break;
                            }
                            else {
                                console.log("Printing: " + _MemoryAccessor.getMDR_MMU());
                                _StdOut.putText(String.fromCharCode(_MemoryAccessor.getMDR_MMU()));
                                this.PC++;
                            }
                        }
                        this.viewProgram();
                        break;
                    }
                    else {
                        this.viewProgram();
                    }
            }

        } 

        /**
         * Method that stores a value in accessor at the location specified by the temporary 'little endian' variable
         * At the end, it changes the current state to 6
         * @param accessor = MemoryAccessor that is connected to the CPU 
         */
        writeBack() { // 5
            _MemoryAccessor.writeMMU(this.little_endian, this.Acc);
            _Memory.show();
        } 

        /**
         * Method that uses the Interrupt Controller to check for generated interrupts. 
         * At the end, it changes the current state to 1 and 'restart' the fetch-decode-execute cycle 
         
        interruptCheck() { // 6
            while (this.inter.checkInterrupts() == 1) {
                super.log("Key Pressed: " + this.inter.getKey());
            }
            this.step = 0;
            this.PC++;
        } 
        */


        /**
         * Method that displays the current state of the CPU
         */
        viewProgram() {
            console.log("PC: " + this.PC + " - IR: " + this.hexLog(this.IR, 2) + " - Acc: " + this.hexLog(this.Acc, 2) + " - Xreg: " + this.hexLog(this.Xreg, 2) + " - Yreg: " + this.hexLog(this.Yreg, 2) + " - Zflag: " + this.Zflag);
        }

        // Method will be adjusted when we implement the 3 sections of memory
        howMuchBranch(branchNumber : number) {

            if ((branchNumber + this.PC) > 255) {
            }
            else {
                return branchNumber;
            }


        }
        /** 
        * Method that takes in a number and converts it into hexadecimal 
        * @param number_to_convert = number that will be converted into hexdecimal
        * @param number_of_zeros = number of zeros to be padded in front of the number
        * @const hex_map = string that contains all 15 hexadecimal digits
        * @return properly formatted hexadecimal number (example. 005C or 023F)
        * 
        */
        hexLog(number_to_convert: number, number_of_zeros: number) {

           const hex_map = "0123456789abcdef";
           let hex = number_to_convert === 0 ? "0" : "";

           while (number_to_convert !== 0) {
               hex = hex_map[number_to_convert & 15] + hex;
               number_to_convert = number_to_convert >>> 4;
           }
               // Make sure that the return is in uppercase for better readability 
               return this.padLeft(hex, "0", number_of_zeros).toUpperCase();
       }
       /**
        * Method that pads a specified string a desired number of times to another string
        * @param text = string that will be padded with 'padChar'
        * @param padChar = string that will be padded to the left
        * @param size = number of times the desired string will be padded
        * @return a string padded with the desired 'padChar' and 'size' 
        */
       padLeft(text: string, padChar: string, size: number): string {
           return (String(padChar).repeat(size) + text).substr( (size * -1), size);
       }
    }
}
    
