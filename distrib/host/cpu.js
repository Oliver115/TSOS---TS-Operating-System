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
var TSOS;
(function (TSOS) {
    class Cpu {
        constructor(PC = 0, IR = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, little_endian = 0x0000, isExecuting = false, state, memSeg = 0, base = 0, limit = 0) {
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.little_endian = little_endian;
            this.isExecuting = isExecuting;
            this.state = state;
            this.memSeg = memSeg;
            this.base = base;
            this.limit = limit;
        }
        init() {
            this.PC = 0;
            this.IR = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.little_endian = 0x0000;
            this.isExecuting = false;
            this.state = "";
            this.memSeg = 0;
            this.base = 0;
            this.limit = 0;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            if (_PCBprogram[2] == 0) {
                for (let i = 0; i < _PCBready.length; i++) {
                    var ready_pcb;
                    ready_pcb = _PCBready[i];
                    if (ready_pcb.get_ID() == _PCBprogram[0]) {
                        ready_pcb.set_state("Running...");
                        this.PC = ready_pcb.get_PC();
                        this.IR = ready_pcb.get_IR();
                        this.Acc = ready_pcb.get_Acc();
                        this.Xreg = ready_pcb.get_Xreg();
                        this.Yreg = ready_pcb.get_Yreg();
                        this.Zflag = ready_pcb.get_Zflag();
                        this.isExecuting = ready_pcb.get_stat();
                        this.state = ready_pcb.get_state();
                        this.memSeg = ready_pcb.get_memSeg();
                        this.base = ready_pcb.get_base();
                        this.limit = ready_pcb.get_limit();
                        _PCBprogram[2] = 1;
                        this.createReadyQueue();
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
        fetch() {
            _MemoryAccessor.readMMU(this.PC);
        }
        /**
         * Method that uses the MemoryAccessor to get the MDR's value and puts it into the Instruction Register
         * At the end, it changes the current state to 3
         * @param accessor = MemoryAccessor that is connected to the CPU
         */
        decode() {
            this.IR = _MemoryAccessor.getMDR_MMU();
            //console.log("Decode: " + this.hexLog(_MemoryAccessor.getMDR_MMU(), 2));
        }
        /**
         * Method that looks at the Instruction Register and executes the instruction based on the value in the IR
         * At the end, it changes the current state to either 5 or 6
         * @param accessor = MemoryAccessor that is connected to the CPU
         * @var temp_PC = variable used for temporarily saving the Program Counter while the CPU uses the Program Counter to communicate back and fourth with the MemoryAccessor
         */
        execute() {
            switch (this.hexLog(this.IR, 2)) {
                // Load the accumulator with a constant
                case "A9":
                    this.PC++;
                    this.fetch();
                    this.Acc = _MemoryAccessor.getMDR_MMU();
                    this.viewProgram();
                    this.createReadyQueue();
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
                    this.createReadyQueue();
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
                    this.createReadyQueue();
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
                    this.createReadyQueue();
                    this.PC++;
                    break;
                // Load the Xreg register with a constant
                case "A2":
                    this.PC++;
                    this.fetch();
                    this.Xreg = _MemoryAccessor.getMDR_MMU();
                    this.viewProgram();
                    this.createReadyQueue();
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
                    this.createReadyQueue();
                    this.PC++;
                    break;
                // Load the Y register with a constant
                case "A0":
                    this.PC++;
                    this.fetch();
                    this.Yreg = _MemoryAccessor.getMDR_MMU();
                    this.viewProgram();
                    this.createReadyQueue();
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
                    this.createReadyQueue();
                    this.PC++;
                    break;
                // No operation
                case "EA":
                    this.viewProgram();
                    this.createReadyQueue();
                    this.PC++;
                    break;
                // Break - Stop System
                case "00":
                    console.log("END");
                    console.log(_PCBresident);
                    console.log(_PCBready);
                    _PCBprogram[1] = false; // CPU is done with the program
                    _PCBprogram[2] = 0; // Set PCB setter to 0
                    this.createReadyQueue();
                    var ready_pcb;
                    for (let i = 0; i < _PCBready.length; i++) {
                        ready_pcb = _PCBready[i];
                        if (ready_pcb.get_ID() == _PCBprogram[0]) {
                            break;
                        }
                    }
                    // Free up memory location
                    _MemoryManager.freeLocation(ready_pcb.get_base(), ready_pcb.get_limit());
                    // Flag location as available
                    _MemoryManager.memoryLocationSetter(this.memSeg, true);
                    // remove program from ready queue
                    for (let i = 0; i < _PCBready.length; i++) {
                        var r_pcb;
                        r_pcb = _PCBready[i];
                        if (r_pcb.get_ID() == _PCBprogram[0]) {
                            //ready_pcb.set_ID(-1);
                            r_pcb.set_state("Terminated");
                        }
                    }
                    // remove program from resident queue
                    for (let i = 0; i < _PCBresident.length; i++) {
                        var resident_pcb;
                        resident_pcb = _PCBresident[i];
                        if (resident_pcb.get_ID() == _PCBprogram[0]) {
                            //resident_pcb.set_ID(-1);
                            resident_pcb.set_state("Terminated");
                        }
                    }
                    this.createReadyQueue();
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
                        this.createReadyQueue();
                        this.PC++;
                    }
                    else {
                        this.Zflag = 1;
                        this.PC = temp_PC;
                        this.viewProgram();
                        this.createReadyQueue();
                        this.PC++;
                    }
                    break;
                // Branch n bytes if Zflag is set to zero (0) 
                case "D0":
                    if (this.Zflag == 1) {
                        this.PC++;
                        this.fetch();
                        this.howMuchBranch(_MemoryAccessor.getMDR_MMU());
                        //this.PC = this.PC + branch;
                        this.viewProgram();
                        this.createReadyQueue();
                    }
                    else {
                        this.PC++;
                        this.PC++;
                        this.viewProgram();
                        this.createReadyQueue();
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
                    this.createReadyQueue();
                    this.PC++;
                    break;
                // System Calls - 
                case "FF":
                    if (this.Xreg == 0x01) { // If there is a 0x01 in the Xreg register. Print the integer in the Y register
                        _StdOut.putText(String(this.Yreg));
                        this.viewProgram();
                        this.createReadyQueue();
                        this.PC++;
                        break;
                    }
                    else {
                        this.viewProgram();
                        this.createReadyQueue();
                    }
                    if (this.Xreg == 0x02) { // If there is a 0x02 in the Xreg register. Print the 0x00 terminated string stored at address in the Y register
                        temp_PC = this.PC;
                        this.PC = _MemoryAccessor.setLowOrderByte(this.Yreg);
                        var continueString = 1;
                        while (continueString == 1) {
                            this.fetch();
                            if (_MemoryAccessor.getMDR_MMU() == 0x00) {
                                this.PC = temp_PC + 1;
                                continueString = 0;
                                break;
                            }
                            else {
                                //console.log("Printing: " + _MemoryAccessor.getMDR_MMU());
                                _StdOut.putText(String.fromCharCode(_MemoryAccessor.getMDR_MMU()));
                                this.PC++;
                            }
                        }
                        this.viewProgram();
                        this.createReadyQueue();
                        break;
                    }
                    else {
                        this.viewProgram();
                        this.createReadyQueue();
                    }
            }
        }
        /**
         * Method that stores a value in accessor at the location specified by the temporary 'little endian' variable
         * At the end, it changes the current state to 6
         * @param accessor = MemoryAccessor that is connected to the CPU
         */
        writeBack() {
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
            var cpuPC = document.getElementById('cpuPC');
            cpuPC.innerHTML = String(this.PC);
            var cpuIR = document.getElementById('cpuIR');
            cpuIR.innerHTML = "0x" + this.hexLog(this.IR, 2);
            var cpuAcc = document.getElementById('cpuAcc');
            cpuAcc.innerHTML = "0x" + this.hexLog(this.Acc, 2);
            var cpuX = document.getElementById('cpuXreg');
            cpuX.innerHTML = "0x" + this.hexLog(this.Xreg, 2);
            var cpuY = document.getElementById('cpuYreg');
            cpuY.innerHTML = "0x" + this.hexLog(this.Yreg, 2);
            var cpuZ = document.getElementById('cpuZflag');
            cpuZ.innerHTML = String(this.Zflag);
        }
        // Create and Update Ready queue display
        createReadyQueue() {
            let readyTable = document.getElementById('ready_queue');
            document.getElementById('ready_queue').innerHTML = "";
            let tbl = document.createElement('table');
            tbl.style.width = '700px';
            tbl.style.border = '1px solid black';
            for (let i = 0; i < _PCBready.length; i++) {
                var ready_pcb;
                ready_pcb = _PCBready[i];
                if ((ready_pcb.get_state() === "Ready") || (ready_pcb.get_state() === "Running...")) {
                    document.getElementById('ready_queue').innerHTML = "";
                    let tr = tbl.insertRow();
                    for (let j = 0; j < 12; j++) {
                        let td = tr.insertCell();
                        switch (j) {
                            case 0:
                                td.appendChild(document.createTextNode(String(ready_pcb.get_ID())));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 1:
                                td.appendChild(document.createTextNode(String(this.PC)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 2:
                                td.appendChild(document.createTextNode(this.hexLog(this.IR, 2)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 3:
                                td.appendChild(document.createTextNode(this.hexLog(this.Acc, 2)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 4:
                                td.appendChild(document.createTextNode(this.hexLog(this.Xreg, 2)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 5:
                                td.appendChild(document.createTextNode(this.hexLog(this.Yreg, 2)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 6:
                                td.appendChild(document.createTextNode(String(this.Zflag)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 7:
                                td.appendChild(document.createTextNode("7")); // This will change for Final Project
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 8:
                                td.appendChild(document.createTextNode(String(this.state)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 9:
                                td.appendChild(document.createTextNode("Memory: " + String(this.memSeg)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            // Not sure if we need these
                            case 10:
                                td.appendChild(document.createTextNode(String(this.base)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 11:
                                td.appendChild(document.createTextNode(String(this.limit)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                        }
                    }
                    readyTable.appendChild(tbl);
                }
                else {
                    document.getElementById('ready_queue').innerHTML = "No Programs Running";
                }
            }
        }
        // Method will be adjusted when we implement the 3 sections of memory
        howMuchBranch(branchNumber) {
            // Branch backwards
            if ((branchNumber + this.PC) >= 0xFF) {
                this.PC = ((branchNumber + this.PC) - 255);
            }
            else {
                this.PC = this.PC + branchNumber;
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
        hexLog(number_to_convert, number_of_zeros) {
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
        padLeft(text, padChar, size) {
            return (String(padChar).repeat(size) + text).substr((size * -1), size);
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map