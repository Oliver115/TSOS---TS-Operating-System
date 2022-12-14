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
                        if (ready_pcb.get_memSeg() == 13) {
                            var dataForDisk = "";
                            var base = 0;
                            var limit = 0;
                            // If there is space in memory, no need for swapping
                            if (_MemoryManager.memoryLocationAvailable() == 7) {
                                // grab most recently used PID and put it in disk
                                var mruProgram = _Dispatcher.mru();
                                var mruMemoryLocation;
                                for (let j = 0; j < _PCBready.length; j++) {
                                    var mruPCB;
                                    mruPCB = _PCBready[j];
                                    if (mruPCB.get_ID() == mruProgram) {
                                        mruMemoryLocation = mruPCB.get_memSeg();
                                        break;
                                    }
                                }
                                switch (mruMemoryLocation) {
                                    case 0:
                                        for (let m = 0x000; m < 0x100; m++) {
                                            dataForDisk = dataForDisk + String(_Memory.getLocation(m));
                                        }
                                        //dataForDisk = String(_Memory.RAM.slice(0x000, 0x100)).replaceAll(",", "");
                                        base = 0;
                                        limit = 255;
                                        break;
                                    case 1:
                                        for (let m = 0x100; m < 0x200; m++) {
                                            dataForDisk = dataForDisk + String(_Memory.getLocation(m));
                                        }
                                        //dataForDisk = String(_Memory.RAM.slice(0x100, 0x200)).replaceAll(",", "");
                                        base = 256;
                                        limit = 511;
                                        break;
                                    case 2:
                                        for (let m = 0x200; m < 0x300; m++) {
                                            dataForDisk = dataForDisk + String(_Memory.getLocation(m));
                                        }
                                        //dataForDisk = String(_Memory.RAM.slice(0x200, 0x300)).replaceAll(",", "");
                                        base = 512;
                                        limit = 767;
                                        break;
                                    default:
                                        _StdOut.putText("Error while swapping! BSOD Incoming...");
                                        _Console.BSOD();
                                        break;
                                }
                                // load data from memory segment into disk
                                _krnDiskDriver.createFromMem(("pid" + String(_Dispatcher.mru())), dataForDisk);
                                // Nuke memory location
                                //_MemoryManager.memoryLocationSetter(mruMemoryLocation, true);
                                _MemoryManager.freeLocation(base, limit);
                            }
                            else {
                                mruMemoryLocation = _MemoryManager.memoryLocationAvailable();
                                switch (mruMemoryLocation) {
                                    case 0:
                                        base = 0;
                                        limit = 255;
                                        break;
                                    case 1:
                                        base = 256;
                                        limit = 511;
                                        break;
                                    case 2:
                                        base = 512;
                                        limit = 767;
                                        break;
                                    default:
                                        _StdOut.putText("Error while loading disk into memory BSOD Incoming...");
                                        _Console.BSOD();
                                        break;
                                }
                            }
                            var newData = _krnDiskDriver.readForMem("pid" + String(ready_pcb.get_ID()));
                            for (let k = 0; k < newData.length; k++) {
                                _MemoryManager.writeImmediate((k + base), newData[k]);
                            }
                            //_MemoryManager.memoryLocationSetter(mruMemoryLocation, false);
                            _OsShell.updateMemTable(1);
                            _krnDiskDriver.delete("pid" + String(ready_pcb.get_ID()), false);
                            _krnDiskDriver.updateDiskView();
                            // correct states and memory locations
                            if (_MemoryManager.memoryLocationAvailable() == 7) {
                                mruPCB.set_memSeg(13);
                                mruPCB.set_state("Ready");
                                mruPCB.set_base(0);
                                mruPCB.set_limit(0);
                                ready_pcb.set_memSeg(mruMemoryLocation);
                            }
                            else {
                                ready_pcb.set_memSeg(mruMemoryLocation);
                                _MemoryManager.memoryLocationSetter(mruMemoryLocation, false);
                            }
                            //_MemoryManager.memoryLocationSetter(mruMemoryLocation, false);
                            ready_pcb.set_base(base);
                            ready_pcb.set_limit(limit);
                            console.log("Now Running: " + _PCBprogram[0]);
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
                        else {
                            console.log("Now Running: " + _PCBprogram[0]);
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
            }
            // Fetch-Decode-Execute Cycle in ONE CPU cycle
            if (rr == true) {
                if (_Scheduler.should_We_Context_Switch() == false) {
                    this.cpuCycle();
                    _Scheduler.scheduleCount();
                }
                else if (_Dispatcher.is_empty()) {
                    this.createReadyQueue();
                    _PCBprogram[1] = false; // CPU is done with the program
                    _Scheduler.countReset();
                }
                else {
                    console.log("SWITCH");
                    this.saveState();
                    _Dispatcher.updateQueue();
                    _PCBprogram[0] = _Dispatcher.next();
                    _PCBprogram[2] = 0;
                    _Scheduler.countReset();
                    _Dispatcher.print();
                }
            }
            else {
                this.cpuCycle();
            }
        }
        cpuCycle() {
            for (let i = 0; i < _PCBready.length; i++) {
                var time_pcb;
                time_pcb = _PCBready[i];
                time_pcb.update_time();
            }
            this.fetch();
            this.decode();
            this.execute();
        }
        increasePC() {
            if (this.PC == 0xFF) {
                _StdOut.putText("Oh no!");
            }
            else {
                this.PC++;
            }
        }
        /**
         * Method that uses the MemoryAccessor to place the Program Counter into the MAR
         * At the end, it changes the current state to 1
         */
        fetch() {
            if ((this.PC + this.base) > this.limit) {
                this.IR = 0;
                _StdOut.putText("PID: " + _PCBprogram[0] + " has been killed for memory violation - MemSeg: " + this.memSeg);
            }
            else {
                _MemoryAccessor.readMMU(this.PC + this.base);
            }
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
            //console.log(this.hexLog(this.IR, 2));
            switch (this.hexLog(this.IR, 2)) {
                // Load the accumulator with a constant
                case "A9":
                    this.increasePC();
                    this.fetch();
                    this.Acc = _MemoryAccessor.getMDR_MMU();
                    this.viewProgram();
                    this.createReadyQueue();
                    this.showCPU();
                    this.increasePC();
                    break;
                // Load the accumulator from accessor
                case "AD":
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);
                    var temp_PC = this.PC;
                    this.PC = this.little_endian;
                    this.fetch();
                    this.Acc = _MemoryAccessor.getMDR_MMU();
                    this.PC = temp_PC;
                    this.viewProgram();
                    this.createReadyQueue();
                    this.showCPU();
                    this.increasePC();
                    break;
                // Store the accumulator in accessor
                case "8D":
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);
                    this.writeBack();
                    this.viewProgram();
                    this.createReadyQueue();
                    this.showCPU();
                    this.increasePC();
                    _OsShell.updateMemTable(1);
                    break;
                // Add contents of an address to the accumulator and keeps the result in the accumulator
                case "6D":
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);
                    temp_PC = this.PC;
                    this.PC = this.little_endian;
                    this.fetch();
                    this.Acc = (this.Acc + _MemoryAccessor.getMDR_MMU());
                    this.PC = temp_PC;
                    this.viewProgram();
                    this.createReadyQueue();
                    this.showCPU();
                    this.increasePC();
                    break;
                // Load the Xreg register with a constant
                case "A2":
                    this.increasePC();
                    this.fetch();
                    this.Xreg = _MemoryAccessor.getMDR_MMU();
                    this.viewProgram();
                    this.createReadyQueue();
                    this.showCPU();
                    this.increasePC();
                    break;
                // Load the Xreg register from accessor
                case "AE":
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);
                    temp_PC = this.PC;
                    this.PC = this.little_endian;
                    this.fetch();
                    this.Xreg = _MemoryAccessor.getMDR_MMU();
                    this.PC = temp_PC;
                    this.viewProgram();
                    this.createReadyQueue();
                    this.showCPU();
                    this.increasePC();
                    break;
                // Load the Y register with a constant
                case "A0":
                    this.increasePC();
                    this.fetch();
                    this.Yreg = _MemoryAccessor.getMDR_MMU();
                    this.viewProgram();
                    this.createReadyQueue();
                    this.showCPU();
                    this.increasePC();
                    break;
                // Load the Y register from accessor
                case "AC":
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);
                    temp_PC = this.PC;
                    this.PC = this.little_endian;
                    this.fetch();
                    this.Yreg = _MemoryAccessor.getMDR_MMU();
                    this.PC = temp_PC;
                    this.viewProgram();
                    this.createReadyQueue();
                    this.showCPU();
                    this.increasePC();
                    break;
                // No operation
                case "EA":
                    this.viewProgram();
                    this.createReadyQueue();
                    this.showCPU();
                    this.increasePC();
                    break;
                // Break - Stop System
                case "00":
                    console.log("END");
                    _PCBprogram[2] = 0; // Set PCB setter to 0
                    this.createReadyQueue();
                    var ready_pcb;
                    for (let i = 0; i < _PCBready.length; i++) {
                        ready_pcb = _PCBready[i];
                        if (ready_pcb.get_ID() == _PCBprogram[0]) {
                            //_Console.advanceLine();
                            //_StdOut.putText("PID " + ready_pcb.get_ID() + " - Turnaround Time: " + ready_pcb.get_turn() + " - Wait Time: " + ready_pcb.get_wait());
                            //_Console.advanceLine();
                            break;
                        }
                    }
                    // Free up memory location
                    _MemoryManager.freeLocation(ready_pcb.get_base(), ready_pcb.get_limit());
                    // Flag location as available
                    _MemoryManager.memoryLocationSetter(this.memSeg, true);
                    _OsShell.updateMemTable(1);
                    // remove program from ready queue
                    ready_pcb.set_state("Terminated");
                    var kill_id = ready_pcb.get_ID();
                    _Dispatcher.removeTarget(kill_id);
                    if (_Dispatcher.is_empty() == false) {
                        _PCBprogram[0] = _Dispatcher.next();
                        _PCBprogram[2] = 0;
                        _Scheduler.countReset();
                    }
                    else {
                        _Scheduler.countReset();
                        _PCBprogram[1] = false; // CPU is done with the program
                        this.showCPU();
                        _StdOut.advanceLine();
                        _StdOut.putText("All Programs Completed");
                    }
                    this.createReadyQueue();
                    _OsShell.updateMemTable(1);
                    break;
                // Compare a byte in accessor to the Xreg register. Sets the Zflag to zero (0) if the byte in accessor and the Xreg register are equal
                case "EC":
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setHighOrderByte(_MemoryAccessor.getMDR_MMU(), this.little_endian);
                    temp_PC = this.PC;
                    this.PC = this.little_endian;
                    //this.PC = this.little_endian;
                    this.fetch();
                    if (_MemoryAccessor.getMDR_MMU() == this.Xreg) {
                        this.Zflag = 1;
                        this.PC = temp_PC;
                        this.viewProgram();
                        this.createReadyQueue();
                        this.showCPU();
                        this.increasePC();
                    }
                    else {
                        this.Zflag = 0;
                        this.PC = temp_PC;
                        this.viewProgram();
                        this.createReadyQueue();
                        this.showCPU();
                        this.increasePC();
                    }
                    break;
                // Branch n bytes if Zflag is set to zero (0) 
                case "D0":
                    if (this.Zflag == 0) {
                        this.increasePC();
                        this.fetch();
                        this.howMuchBranch(_MemoryAccessor.getMDR_MMU());
                        //this.PC = this.PC + branch;
                        this.viewProgram();
                        this.createReadyQueue();
                        this.showCPU();
                    }
                    else {
                        this.increasePC();
                        this.increasePC();
                        this.viewProgram();
                        this.createReadyQueue();
                        this.showCPU();
                    }
                    break;
                // Increment the value of a byte
                case "EE":
                    this.increasePC();
                    this.fetch();
                    this.little_endian = _MemoryAccessor.setLowOrderByte(_MemoryAccessor.getMDR_MMU());
                    this.increasePC();
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
                    this.showCPU();
                    this.increasePC();
                    _OsShell.updateMemTable(1);
                    break;
                // System Calls - 
                case "FF":
                    if (this.Xreg == 0x01) { // If there is a 0x01 in the Xreg register. Print the integer in the Y register
                        _StdOut.putText(String(this.Yreg));
                        this.viewProgram();
                        this.createReadyQueue();
                        this.showCPU();
                        this.increasePC();
                        break;
                    }
                    else {
                        this.viewProgram();
                        this.createReadyQueue();
                        this.showCPU();
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
                                this.increasePC();
                            }
                        }
                        this.viewProgram();
                        this.createReadyQueue();
                        this.showCPU();
                        break;
                    }
                    else {
                        this.viewProgram();
                        this.createReadyQueue();
                        this.showCPU();
                    }
                default:
                    _StdOut.putText("Invalid op code detected! PID: " + _PCBprogram[0] + " will be killed!");
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
                            _Dispatcher.remove();
                        }
                    }
                    _PCBprogram[1] = false;
                    this.createReadyQueue();
                    break;
            }
        }
        /**
         * Method that stores a value in accessor at the location specified by the temporary 'little endian' variable
         * At the end, it changes the current state to 6
         * @param accessor = MemoryAccessor that is connected to the CPU
         */
        writeBack() {
            if (this.little_endian > 255) {
                this.IR = 0;
                _StdOut.putText("PID: " + _PCBprogram[0] + " has been killed for memory violation - MemSeg: " + this.memSeg);
            }
            else {
                _MemoryAccessor.writeMMU(this.little_endian + this.base, this.Acc);
                if (debug == true) {
                    _Memory.show();
                }
            }
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
            _PCBprogram[1] = false;
            let readyTable = document.getElementById('ready_queue');
            document.getElementById('ready_queue').innerHTML = "";
            let tbl = document.createElement('table');
            tbl.style.width = '700px';
            tbl.style.border = '1px solid black';
            // Create table headers
            let thead = tbl.createTHead();
            let row = thead.insertRow();
            var text;
            for (let i = 0; i < 12; i++) {
                let th = document.createElement("th");
                switch (i) {
                    case 0:
                        text = document.createTextNode("PID");
                        break;
                    case 1:
                        text = document.createTextNode("PC");
                        break;
                    case 2:
                        text = document.createTextNode("IR");
                        break;
                    case 3:
                        text = document.createTextNode("Acc");
                        break;
                    case 4:
                        text = document.createTextNode("Xreg");
                        break;
                    case 5:
                        text = document.createTextNode("Yreg");
                        break;
                    case 6:
                        text = document.createTextNode("Zflag");
                        break;
                    case 7:
                        text = document.createTextNode("Priority");
                        break;
                    case 8:
                        text = document.createTextNode("State");
                        break;
                    case 9:
                        text = document.createTextNode("Segment");
                        break;
                    case 10:
                        text = document.createTextNode("Base");
                        break;
                    case 11:
                        text = document.createTextNode("Limit");
                        break;
                }
                th.appendChild(text);
                row.appendChild(th);
            }
            for (let i = 0; i < _PCBready.length; i++) {
                var ready_pcb;
                ready_pcb = _PCBready[i];
                if (ready_pcb.get_state() === "Running...") {
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
                                if (this.memSeg == 13) {
                                    td.appendChild(document.createTextNode("On Disk"));
                                }
                                else {
                                    td.appendChild(document.createTextNode(String(this.state)));
                                }
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 9:
                                if (this.memSeg == 13) {
                                    td.appendChild(document.createTextNode("Disk"));
                                }
                                else {
                                    td.appendChild(document.createTextNode("Memory: " + String(this.memSeg)));
                                }
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
                    _PCBprogram[1] = true;
                }
                else if (ready_pcb.get_state() === "Ready") {
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
                                td.appendChild(document.createTextNode(String(ready_pcb.get_PC())));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 2:
                                td.appendChild(document.createTextNode(this.hexLog(ready_pcb.get_IR(), 2)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 3:
                                td.appendChild(document.createTextNode(this.hexLog(ready_pcb.get_Acc(), 2)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 4:
                                td.appendChild(document.createTextNode(this.hexLog(ready_pcb.get_Xreg(), 2)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 5:
                                td.appendChild(document.createTextNode(this.hexLog(ready_pcb.get_Yreg(), 2)));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 6:
                                td.appendChild(document.createTextNode(String(ready_pcb.get_Zflag())));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 7:
                                td.appendChild(document.createTextNode("7")); // This will change for Final Project
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 8:
                                if (ready_pcb.get_memSeg() == 13) {
                                    td.appendChild(document.createTextNode("On Disk"));
                                }
                                else {
                                    td.appendChild(document.createTextNode(ready_pcb.get_state()));
                                }
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 9:
                                if (ready_pcb.get_memSeg() == 13) {
                                    td.appendChild(document.createTextNode("Disk"));
                                }
                                else {
                                    td.appendChild(document.createTextNode("Memory: " + String(ready_pcb.get_memSeg())));
                                }
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            // Not sure if we need these
                            case 10:
                                td.appendChild(document.createTextNode(String(ready_pcb.get_base())));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                            case 11:
                                td.appendChild(document.createTextNode(String(ready_pcb.get_limit())));
                                td.style.border = '1px solid black';
                                td.style.width = '10px';
                                break;
                        }
                    }
                    readyTable.appendChild(tbl);
                    _PCBprogram[1] = true;
                }
                else {
                    _PCBprogram[1] = true;
                }
            }
            if (_Dispatcher.is_empty()) {
                document.getElementById('ready_queue').innerHTML = "No Programs Running";
                _PCBprogram[1] = false;
            }
        }
        // Method that determines how much to branch
        howMuchBranch(branchNumber) {
            // Branch backwards
            if ((branchNumber + this.PC) >= 0xFF) {
                this.PC = ((branchNumber + this.PC) - 255);
            }
            else {
                this.PC = this.PC + branchNumber + 1;
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
        saveState() {
            for (let i = 0; i < _PCBready.length; i++) {
                var local_pcb;
                local_pcb = _PCBready[i];
                if (local_pcb.get_ID() == _PCBprogram[0]) {
                    local_pcb.set_PC(this.PC);
                    local_pcb.set_IR(this.IR);
                    local_pcb.set_Acc(this.Acc);
                    local_pcb.set_Xreg(this.Xreg);
                    local_pcb.set_Yreg(this.Yreg);
                    local_pcb.set_Zflag(this.Zflag);
                    local_pcb.set_base(this.base);
                    local_pcb.set_limit(this.limit);
                    local_pcb.set_memSeg(this.memSeg);
                    if (local_pcb.get_state() === "Running...") {
                        local_pcb.set_state("Ready");
                    }
                }
            }
        }
        showCPU() {
            if (debug == true) {
                console.log("PC: " + (this.PC + this.base) + " - IR: " + this.hexLog(this.IR, 2) + " - Acc: " + this.hexLog(this.Acc, 2) + " - X: " + this.hexLog(this.Xreg, 2) + " - Y: " + this.hexLog(this.Yreg, 2) + " - Flag: " + this.Zflag);
            }
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map