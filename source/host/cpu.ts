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

        accessor : MemoryAccessor;

        constructor(public PC: number = 0,
                    public IR: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public step: number = 0,
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
            this.step = 0;
            this.little_endian = 0x0000;
            this.isExecuting = false;
        }

        
        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // Based on the value of this.step, execute the individual steps of the fetch-decode-execute cycle
            switch(this.step) {

                // Fetch step of the cycle
                case 0:
                    this.fetch(this.accessor);
                        this.viewProgram();
                        break;

                // Decode step of the cycle
                case 1:
                    this.decode(this.accessor);
                    this.viewProgram();
                    break;

                // Execute step fo the cycle
                case 3:
                    this.execute(this.accessor);
                    this.viewProgram();
                    break;

                // If needed, write back the data to accessor
                case 5:
                    this.writeBack(this.accessor);
                    this.viewProgram();
                    break;

                // After every cycle, check for interrupts
                case 6:
                    //this.interruptCheck();
                    this.viewProgram();
                    break;
            }
        }

        /**
         * Method that uses the MemoryAccessor to place the Program Counter into the MAR
         * At the end, it changes the current state to 1
         * @param accessor = MemoryAccessor that is connected to the CPU 
         */
        fetch(accessor : MemoryAccessor) { // 0
            accessor.readMMU(this.PC);
            this.step = 1;
        }

        /**
         * Method that uses the MemoryAccessor to get the MDR's value and puts it into the Instruction Register
         * At the end, it changes the current state to 3
         * @param accessor = MemoryAccessor that is connected to the CPU 
         */
        decode(accessor : MemoryAccessor) { // 1
            this.IR = accessor.getMDR_MMU();
            this.step = 3;
        } 

        /**
         * Method that looks at the Instruction Register and executes the instruction based on the value in the IR
         * At the end, it changes the current state to either 5 or 6
         * @param accessor = MemoryAccessor that is connected to the CPU 
         * @var temp_PC = variable used for temporarily saving the Program Counter while the CPU uses the Program Counter to communicate back and fourth with the MemoryAccessor
         */
        execute(accessor : MemoryAccessor) { // 3
            switch(this.hexLog(this.IR, 2)) {

                // Load the accumulator with a constant
                case "A9": 
                    this.PC++;
                    this.fetch(this.accessor);
                    this.Acc = accessor.getMDR_MMU();
                    this.step = 6;
                    break;

                // Load the accumulator from accessor
                case "AD": 
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setLowOrderByte(accessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setHighOrderByte(accessor.getMDR_MMU(), this.little_endian);

                    var temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch(this.accessor);
                    this.Acc = accessor.getMDR_MMU();

                    this.PC = temp_PC;
                    this.step = 6;
                    break;

                // Store the accumulator in accessor
                case "8D":
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setLowOrderByte(accessor.getMDR_MMU());

                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setHighOrderByte(accessor.getMDR_MMU(), this.little_endian);

                    this.step = 5;
                    break;

                // Load the accumulator from Xreg register
                case "8A": 
                    this.Acc = this.Xreg;
                    this.step = 6;
                    break;

                // Load the accumulator from Y register
                case "98": 
                    this.Acc = this.Yreg;
                    this.step = 6;
                    break;

                // Add contents of an address to the accumulator and keeps the result in the accumulator
                case "6D": 
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setLowOrderByte(accessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setHighOrderByte(accessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch(this.accessor);
                    this.Acc = (this.Acc + accessor.getMDR_MMU());

                    this.PC = temp_PC;

                    this.step = 6;
                    break;

                // Load the Xreg register with a constant
                case "A2": 
                    this.PC++;
                    this.fetch(this.accessor);
                    this.Xreg = accessor.getMDR_MMU();

                    this.step = 6;
                    break;

                // Load the Xreg register from accessor
                case "AE": 
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setLowOrderByte(accessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setHighOrderByte(accessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch(this.accessor);
                    this.Xreg = accessor.getMDR_MMU();

                    this.PC = temp_PC;
                    this.step = 6;
                    break;

                // Load the Xreg register from the accumulator 
                case "AA": 
                    this.Xreg = this.Acc;
                    this.step = 6;
                    break;

                // Load the Y register with a constant
                case "A0": 
                    this.PC++;
                    this.fetch(this.accessor);
                    this.Yreg = accessor.getMDR_MMU();

                    this.step = 6;
                    break;

                // Load the Y register from accessor
                case "AC": 
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setLowOrderByte(accessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setHighOrderByte(accessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch(this.accessor);
                    this.Yreg = accessor.getMDR_MMU();

                    this.PC = temp_PC;
                    this.step = 6;
                    break;

                // Load the Y register from the accumulator
                case "A8": 
                    this.Yreg = this.Acc;
                    this.step = 6;
                    break;

                // No operation
                case "EA": 
                    this.step = 6;
                    break;

                // Break - Stop System
                case "00": 
                    super.log("Program has ended!");
                    process.exit();

                // Compare a byte in accessor to the Xreg register. Sets the Zflag to zero (0) if the byte in accessor and the Xreg register are equal
                case "EC": 
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setLowOrderByte(accessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setHighOrderByte(accessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.PC = this.little_endian;
                    this.fetch(this.accessor);

                    if (accessor.getMDR_MMU() == this.Xreg) {
                        this.Zflag = 1;
                        this.PC = temp_PC;
                        this.step = 6;
                    }
                    else {
                        this.Zflag = 0;
                        this.PC = temp_PC;
                        this.step = 6;
                    }
                    break;

                // Branch n bytes if Zflag is set to zero (0) 
                case "D0": 
                    if (this.Zflag == 0) {
                        this.PC++;
                        this.fetch(this.accessor);
                        var branch = (this.signedConverter(accessor.getMDR_MMU())); 

                        if (accessor.getMDR_MMU() < 127) {
                            this.PC = this.PC + branch;
                            this.step = 6;
                        }
                        else {
                            this.PC = this.PC + branch;
                            this.step = 6;
                        }
                    }
                    else {
                        this.PC++;
                        this.step = 6;
                    }
                    break;

                // Increment the value of a byte
                case "EE": 
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setLowOrderByte(accessor.getMDR_MMU());
                    
                    this.PC++;
                    this.fetch(this.accessor);
                    this.little_endian = accessor.setHighOrderByte(accessor.getMDR_MMU(), this.little_endian);

                    temp_PC = this.PC;
                    this.PC = this.little_endian;

                    this.fetch(this.accessor);
                    var tempAcc = this.Acc;
                    this.Acc = (accessor.getMDR_MMU() + 0x01);

                    this.writeBack(this.accessor);

                    this.Acc = tempAcc;
                    this.PC = temp_PC;
                    this.step = 5;
                    break;

                // System Calls - 

                case "FF": 
                    if (this.Xreg == 0x01) { // If there is a 0x01 in the Xreg register. Print the integer in the Y register
                        _StdOut.putText(this.hexLog(this.Yreg, 2));
                        this.step = 6;
                        break;
                    }
                    else {
                        this.step = 6;
                    }

                    if (this.Xreg == 0x02) { // If there is a 0x02 in the Xreg register. Print the 0x00 terminated string stored at address in the Y register

                        temp_PC = this.PC;
                        this.PC = accessor.setLowOrderByte(this.Yreg);

                        var continueString = 1;
                        while(continueString == 1) {

                            this.fetch(this.accessor);

                            if (accessor.getMDR_MMU() == 0x00) {
                                this.PC = temp_PC;
                                continueString = 0;
                                break;
                            }
                            else {
                                _StdOut.putText(this.ascii.decode(accessor.getMDR_MMU()));
                                this.PC++;
                            }
                        }
                        this.step = 6;
                        break;
                    }
                    else {
                        this.step = 6;
                    }

                    if (this.Xreg == 0x03) { // If there is a 0x03 in the Xreg register. Print the 0x00 terminated string from the address in the operand

                        this.PC++;
                        this.fetch(this.accessor);
                        this.little_endian = accessor.setLowOrderByte(accessor.getMDR_MMU());
                        
                        this.PC++;
                        this.fetch(this.accessor);
                        this.little_endian = accessor.setHighOrderByte(accessor.getMDR_MMU(), this.little_endian);

                        temp_PC = this.PC;
                        this.PC = this.little_endian;

                        var continueString = 1;
                        while(continueString == 1) {

                            this.fetch(this.accessor);

                            if (accessor.getMDR_MMU() == 0x00) {
                                this.PC = temp_PC;
                                continueString = 0;
                                break;
                            }
                            else {
                                _StdOut.putText(this.ascii.decode(accessor.getMDR_MMU()));
                                this.PC++;
                            }
                        }
                        this.step = 6;
                        break;
                    }
                    else {
                        this.step = 6;
                    }
                    break;
            }

        } 

        /**
         * Method that stores a value in accessor at the location specified by the temporary 'little endian' variable
         * At the end, it changes the current state to 6
         * @param accessor = MemoryAccessor that is connected to the CPU 
         */
        writeBack(accessor : MemoryAccessor) { // 5
            accessor.writeMMU(this.little_endian, this.Acc);
            this.step = 6;
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
        viewProgram() {}

        /**
         * Method that transforms a decimal value into signed 2's complement. (Used to determine how many spaces to branch)
         * @param branchNumber = number to be converted into signed 2's complement
         * @param return_spaces = number of spaces to branch backwards
         * @return number of spaces to branch (backwards or forwards)
         */
        signedConverter(branchNumber : number) {
            if (branchNumber == 0x80) {
                return 0;
            }
            else {
                if ((branchNumber - 127) <= 0) {
                    return branchNumber;
                }
                else {
                    var return_spaces = -1;
                    for (let i = 255; i > branchNumber; i--) {
                        return_spaces = (return_spaces - 1);
                    }
                    return return_spaces;
                }
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
    
