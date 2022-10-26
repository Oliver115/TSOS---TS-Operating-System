/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;

            tableCreate(0);
            updateMemory();
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Display today's date.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereami,
                                  "whereami",
                                  "- Show user's current location.");
            this.commandList[this.commandList.length] = sc;

            // weather
            sc = new ShellCommand(this.shellWeather,
                                  "weather",
                                  "- Display weather forecast based on location.");
            this.commandList[this.commandList.length] = sc;

            // favprof
            sc = new ShellCommand(this.shellFav_prof,
                "favprof",
                "- Oliver's favourite professor. Note: It will not be Prof. Algozzine...");
            this.commandList[this.commandList.length] = sc;

            // lifemeaning
            sc = new ShellCommand(this.shellLifemeaning,
                "lifemeaning",
                "- A question we've all pondered...");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "- Set new status message for the host task bar.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Validate the user code. Only hex digits and spaces are valid.");
            this.commandList[this.commandList.length] = sc;

            // Run
            sc = new ShellCommand(this.shellRun,
                "run",
                "- Run program with specified PID.");
            this.commandList[this.commandList.length] = sc;

            // BSOD
            sc = new ShellCommand(this.shellOrder66,
                "order66",
                "- Kill not just the OS, but the women and children too (it's a Star Wars quote. Pls don't think I'm a psychopath)");
            this.commandList[this.commandList.length] = sc;

            // Clear Memory
            sc = new ShellCommand(this.shellClearmem,
                "clearmem",
                "- Clear all memory partitions");
            this.commandList[this.commandList.length] = sc;

            // Kill
            sc = new ShellCommand(this.shellKill,
                "kill",
                "- Kill a specific process");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 3. Lower-case the command NOT the command-line args, if any

            // Should commands be case-sensitive? - NO
            //tempList[0].toLowerCase();
            tempList[0] = tempList[0].toLowerCase();

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                var help_command_queue = ("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                for(let i = 0; i < help_command_queue.length; i++) {
                    _StdOut.putText(help_command_queue.charAt(i));
                }
                //_StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
            // Done
        }

        // TODO: Add interesting and creative prompts
        // Joke?

        public shellDate(args: string[]) {
            const today = new Date()
            _StdOut.putText(today.toUTCString())
        }

        public shellWhereami(args: string[]) {
            var story = ("You are sitting on a chair located in one of the spiral arms of the Milky Way " +
            "called the Orion Arm) which lies about two-thirds of the way out from the center of the Galaxy.");
                for(let i = 0; i < story.length; i++) {
                    _StdOut.putText(story.charAt(i));
                }
        }

        public shellWeather(args: string[]) {
            _StdOut.putText("Go outside to figure it out.");
        }

        public shellFav_prof(args: string[]) {
            _StdOut.putText("The answer is obvious! Prof. Algozzine!");
        }

        public shellLifemeaning(args: string[]) {
            _StdOut.putText("Calculating the meaning of life... Error 404. Meaning not found.");
        }

        public shellClearmem(args: string[]) {
            for(let i = 0; i < 0x300; i++) {
                _MemoryManager.writeImmediate(i, "0x00");
            } 
            tableCreate(1);
            _StdOut.putText("All Memory partitions cleared. Memory has no friends now...")
        }

        public shellLoad(args: string[]) {
            // Check if memory locations are available
            if (_MemoryManager.memoryLocationAvailable() < 4) {
                let user_input: string;
                user_input = document.getElementById('taProgramInput').value;
                user_input = user_input.toUpperCase(); user_input = user_input.replaceAll(" ", "");

                // Check Hex Code
                var validHex = user_input => {
                    const legend = '0123456789ABCDEF';
                    for(let i = 0; i < user_input.length; i++) {
                        if (legend.includes(user_input[i])) {
                            continue;
                        }
                    return false;
                    }
                    return true;
                }

                if (validHex(user_input)) {
                    if (user_input == "") {
                        _StdOut.putText("Hex Code not valid.");
                    }
                    else {
                        _PCB_ID += 1;
                        _StdOut.putText("Input loaded successfully at Memory Segment " + _MemoryManager.memoryLocationAvailable() + " with Process ID: " + _PCB_ID);
                        var user_text_area = document.getElementById('taProgramInput'); 
                        user_text_area.value = "";

                        // load hex code into memory
                        const hex_for_appending = "0x"
                        var program = [];
                        for(let j = 0; j < user_input.length; j++) {
                            var temp_var = (parseInt((hex_for_appending + user_input[j] + user_input[j + 1]), 16));
                            j++;
                            program.push(temp_var);
                        }
                        // Change base and limit based on memory location
                        var base = 0;
                        var limit = 0;
                        switch (_MemoryManager.memoryLocationAvailable()) {
                            case 0:
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
                                _StdOut.putText("Error while loading memory... order66 is coming...");
                                setInterval(function () { _Console.BSOD(); _Kernel.krnShutdown(); }, 5000);
                        }
                        for(let k = 0; k < program.length; k++) {
                            _MemoryManager.writeImmediate((k + base), program[k]);
                        }
                        var newPCB = new PCB(_PCB_ID, 0, 0, 0, 0, 0, 0, false, _MemoryManager.memoryLocationAvailable(), base, limit);
                        _PCBs.push(newPCB);

                        // Flag memory location as full
                        _MemoryManager.memoryLocationSetter(_MemoryManager.memoryLocationAvailable(), false);

                        tableCreate(1);
                    }
                } 
                else {
                    _StdOut.putText("Hex Code not valid.");
                }
            }
            else {
                _StdOut.putText("Memory is finito");
            }
        }

        public shellRun(args: string[]) {
            if (args.length > 0) {
                if (_PCBs.length == 0) {
                    _StdOut.putText("Memory is lonely :(  Please give it a friend by loading a program")
                }
                else {
                    // Iterate through PCBs to find respective PCB ID
                    for(let i = 0; i < _PCBs.length; i++) {
                        var temp_pcb: PCB; temp_pcb = _PCBs[i];
                        var was_pcb_found = false;
                        
                        // Found correct PCB
                        if (temp_pcb.get_ID() == parseInt(args[0])) {
                            was_pcb_found = true; // Mark as found
                            if (temp_pcb.get_stat() == true) {
                                _StdOut.putText("PID " + temp_pcb.get_ID() + " was not found in the resident queue.");
                                break;
                            }
                            else {
                                _StdOut.putText("Executing Program with PID: " + temp_pcb.get_ID());
                                _PCBprogram[0] = parseInt(args[0]); _PCBprogram[1] = true;
                                break;
                            }
                        }
                    }
                    // If no PCB with speficied PID was not found:
                    if (was_pcb_found == false) {
                        _StdOut.putText("PID " + args + " was not found. Please supply a valid PID.");
                    }
                }
            } 
            else {
                _StdOut.putText("Usage: run <PID>  Please supply a valid PID.");
            } 
        }

        // Kill themed commands here: 
        public shellKill(args: string[]) {
            if (args.length > 0) {
                var pid_to_be_killed = args[0];

                // If no programs running. No need to kill. Right...?
                if (_PCBs.length == 0) {
                    _StdOut.putText("Why so aggressive? There are no programs to kill");
                } 
                else {
                    // iterate through PCBs 
                    for(let i = 0; i < _PCBs.length; i++) {
                        var temp_pcb: PCB; temp_pcb = _PCBs[i];
                        // If PCB exists and is currently running, kill it
                        if ( (temp_pcb.get_ID() == parseInt(pid_to_be_killed)) && (_PCBprogram[1] == true)) {
                            _PCBprogram[1] = false;
                            _PCBprogram[2] = 0
                            var pcbStat = document.getElementById("pcbStat");
                                        pcbStat.innerHTML = ("Order 66ed")
                            _StdOut.putText("Program Halted!")
                        }
                    }
                }
            } 
            else {
                _StdOut.putText("Usage: kill <PID>");
            }
        }

        public shellOrder66(args: string[]) {
            _StdOut.putText("It will be done my lord...");
            setInterval(function () { _Console.BSOD(); _Kernel.krnShutdown(); }, 3000); // 3sec to build suspense
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Display project name and version.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown Revilo OS. Leaves underlying host and hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the screen.");
                        break;
                    case "trace":
                        _StdOut.putText("Toggle OS trace. <on | off>");
                        break;
                    case "rot13":
                        _StdOut.putText("Does rot13 obfuscation on a given string.");
                        break;
                    case "prompt":
                        _StdOut.putText("Sets the prompt.");
                        break;
                    case "date":
                        _StdOut.putText("Display today's date.");
                        break;
                    case "whereami":
                        _StdOut.putText("In case you're lost, this will help you orientate yourself");
                        break;
                    case "weather":
                        _StdOut.putText("Going outside? Check the weather.");
                        break;
                    case "favprof":
                        _StdOut.putText("Oliver's favourite professor.");
                        break;
                    case "lifemeaning":
                        _StdOut.putText("A question we've all pondered...");
                        break;
                    case "status":
                        _StdOut.putText("Set new status message.");
                        break;
                    case "load":
                        _StdOut.putText("Load and validate user input (Only hex values are accepted)");
                        break;
                    case "order66":
                        _StdOut.putText("Manual shutdown.");
                        break;
                    case "run":
                        _StdOut.putText("Run program with specified PID.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellStatus(args: string) {
            if (args.length > 0) {
                var temp_message = args.toString().replaceAll(",", " ");
                // Make sure the new message will fit in the box
                if (temp_message.length >= 130) {
                    _StdOut.putText("Status message too long.");
                } else {
                    _StdOut.putText("Status message updated.");
                    stat_message = temp_message;
                }
            } else {
                _StdOut.putText("Usage: status <message>  Please enter a message.");
            }
        }
        
        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
    }
}

function getNewMessage() {
    return stat_message;
}

function tableCreate(table: number) {

    if (table == 1) {
        document.getElementById("tableMem").innerHTML = "";
    }

    let memTable = document.getElementById('tableMem'); 
    let tbl  = document.createElement('table');
    tbl.style.width  = '700px';
    tbl.style.border = '1px solid black';

    var marker = 0;
    var memoryAdd = 0;

    for(let i = 0; i < 0x60; i++){
        let tr = tbl.insertRow();

        for(let j = 0; j < 9; j++) {
            let td = tr.insertCell();

            if (j < 1) {
                td.appendChild(document.createTextNode("0x" + _Memory.hexLog(marker, 3)));
                td.style.border = '3px solid black';
                marker = marker + 8;
            }
            else {
                td.appendChild(document.createTextNode("0x" + _Memory.getLocation(memoryAdd)));
                td.style.border = '1px solid black';
                memoryAdd = memoryAdd + 1;
            }
        }   
    }
    memTable.appendChild(tbl);
}

function updateMemory() {
    var memTitle = document.getElementById('memoryHead'); 
        memTitle.innerHTML = "Memory View";
}



