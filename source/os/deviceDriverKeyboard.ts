/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.

            if ((keyCode >= 186) && (keyCode <= 222)){
                switch (keyCode) {
                    case 186:
                        if (isShifted === true) { chr = String.fromCharCode(58); } else { chr = String.fromCharCode(59); }
                        break;
                    case 187:
                        if (isShifted === true) { chr = String.fromCharCode(43); } else { chr = String.fromCharCode(61); }
                        break;
                    case 188:
                        if (isShifted === true) { chr = String.fromCharCode(60); } else { chr = String.fromCharCode(44); }
                        break;
                    case 189:
                        if (isShifted === true) { chr = String.fromCharCode(95); } else { chr = String.fromCharCode(45); }
                        break;
                    case 190:
                        if (isShifted === true) { chr = String.fromCharCode(62); } else { chr = String.fromCharCode(46); }
                        break;
                    case 191:
                        if (isShifted === true) { chr = String.fromCharCode(63); } else { chr = String.fromCharCode(47); }
                        break;
                    case 192:
                        if (isShifted === true) { chr = String.fromCharCode(126); } else { chr = String.fromCharCode(96); }
                        break;
                    case 219:
                        if (isShifted === true) { chr = String.fromCharCode(123); } else { chr = String.fromCharCode(91); }
                        break;
                    case 220:
                        if (isShifted === true) { chr = String.fromCharCode(124); } else { chr = String.fromCharCode(92); }
                        break;
                    case 221:
                        if (isShifted === true) { chr = String.fromCharCode(125); } else { chr = String.fromCharCode(93); }
                        break;
                    case 222:
                        if (isShifted === true) { chr = String.fromCharCode(34); } else { chr = String.fromCharCode(96); }
                        break;
                    default:
                        chr = String.fromCharCode(32);
                }
                _KernelInputQueue.enqueue(chr);
            }

            else if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) { 
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } 
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } 
            else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits 48 - 57
                      (keyCode == 32)                     ||   // space
                      (keyCode == 13)) {                       // enter
                        if (isShifted === true) {
                            switch (keyCode) {
                                case 48:
                                    chr = String.fromCharCode(41);
                                    break;
                                case 49:
                                    chr = String.fromCharCode(33);
                                    break;
                                case 50:
                                    chr = String.fromCharCode(64);
                                    break;
                                case 51:
                                    chr = String.fromCharCode(35);
                                    break;
                                case 52:
                                    chr = String.fromCharCode(36);
                                    break;
                                case 53:
                                    chr = String.fromCharCode(37);
                                    break;
                                case 54:
                                    chr = String.fromCharCode(94);
                                    break;
                                case 55:
                                    chr = String.fromCharCode(38);
                                    break;
                                case 56:
                                    chr = String.fromCharCode(42);
                                    break;
                                case 57:
                                    chr = String.fromCharCode(40);
                                    break;
                                default:
                                    chr = String.fromCharCode(32);
                            }
                            _KernelInputQueue.enqueue(chr);
                        }  
                        else {
                            chr = String.fromCharCode(keyCode);
                            _KernelInputQueue.enqueue(chr);
                        }                     
            }
            
        }
    }
}
