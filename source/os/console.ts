/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {
    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public commandHistory = [],
                    public commandCount) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    if (this.commandHistory.length > 7) {
                        this.commandHistory.pop()
                        this.commandHistory.push(this.buffer)
                    }
                    else {
                        this.commandHistory.push(this.buffer); 
                    }
                    this.buffer = "";
                    this.commandCount = this.commandHistory.length;
                } 
                /* TAB
                Approach: If two commands start with the same letter such as 'shutdown' and 'status,' and the user inputs the letter s 
                and presses Tab, nothing will happen. The user will have to enter as a minimum 'sh' for shutdown and 'st' for status.
                Same logic applies for any similar commands.

                */
                else if (chr === String.fromCharCode(9)) {
                    var commands = ["ver", "help", "shutdown", "cls", "man", "trace", 
                                      "rot13", "prompt", "date", "whereami", "weather", "favprof", "lifemeaning", "status"];
                    var counter = 0;
                    var command_location = 0;

                    for(let i = 0; i < commands.length; i++) {
                        console.log(this.buffer);
                        console.log(commands[i]);
                        console.log(commands[i].startsWith(this.buffer));

                        // Check if two commands start with the same substring
                        if (commands[i].startsWith(this.buffer) == true) { counter += 1; command_location = i}
                    }
                    console.log(counter);
                    if (counter == 1) {
                        this.buffer = commands[command_location];

                        this.deleteLine();
                        for(let k = 0; k < commands[command_location].length; k++) {
                            this.putText(commands[command_location].charAt(k));
                        }
                        _OsShell.handleInput(this.buffer);
                        this.commandHistory.push(this.buffer);
                        this.buffer = "";
                    }
                }
                
                
                // UP arrow key
                else if (chr === String.fromCharCode(17)) {

                    if (this.commandCount - 1 >= 2) {
                        this.commandCount--;
                        this.deleteLine();
                        for(let i = 0; i < this.commandHistory[this.commandCount].length; i++) {
                            this.putText(this.commandHistory[this.commandCount].charAt(i));
                        }
                        
                        this.buffer = this.commandHistory[this.commandCount];
                    }
                }
                else if (chr === String.fromCharCode(18)) {

                    if (this.commandCount + 1 < this.commandHistory.length) {
                        this.commandCount++;
                        this.deleteLine();
                        for(let i = 0; i < this.commandHistory[this.commandCount].length; i++) {
                            this.putText(this.commandHistory[this.commandCount].charAt(i));
                        }
                        
                        this.buffer = this.commandHistory[this.commandCount];
                    }
                    else {
                        this.deleteLine();
                        this.buffer = "";
                    }
                }
                
                else if (chr === String.fromCharCode(8)) {
                    this.delete(this.buffer.charAt(this.buffer.length - 1));
                    this.buffer = this.buffer.slice(0, -1);
                }

                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        }

        public delete(text): void {
            if (text !== "") {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition - offset;

                var cnv = document.getElementById("display");
                var ctxt = cnv.getContext("2d");
                ctxt.beginPath();
                ctxt.fillStyle = "#DFDBC3";
                ctxt.fillRect(this.currentXPosition, this.currentYPosition + 5, 15, -20);
                ctxt.stroke();
            }
        }
        public deleteLine(): void {
                var cnv = document.getElementById("display");
                var ctxt = cnv.getContext("2d");
                ctxt.beginPath();
                ctxt.fillStyle = "#DFDBC3";
                ctxt.fillRect(12, this.currentYPosition + 5, 200, -20);
                ctxt.stroke();
                this.currentXPosition = 12;
        }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // TODO: Handle scrolling. (iProject 1)
        }
    }
 }
