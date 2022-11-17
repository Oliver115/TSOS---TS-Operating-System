/* ----------------------------------
   DeviceDriverDisk.ts

   The Kernel Disk Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnDrDriverEntry;
        }
        krnDrDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        format() {
            // track
            for (let t = 0; t < _Disk.track; t++) {
                // sector
                for (let s = 0; s < _Disk.sector; s++) {
                    // block
                    for (let b = 0; b < _Disk.block; b++) {
                        var key = (t + "" + s + "" + b);
                        var value = [];
                        for (let k = 0; k < 4; k++) {
                            value[k] = 0;
                        }
                        for (let j = 4; j < 64; j++) {
                            value[j] = "~";
                        }
                        if ((t == 0) && (s == 0) && (b == 0)) {
                            value[0] = 1;
                            sessionStorage.setItem(key, String(value));
                        }
                        else {
                            sessionStorage.setItem(key, String(value));
                        }
                    }
                }
            }
            var diskView = document.getElementById("diskHead");
            diskView.innerHTML = "Disk";
            _StdOut.putText("Disk Formatted");
            this.updateDiskView();
        }
        updateDiskView() {
            let diskTable = document.getElementById('tableDisk');
            let tbl = document.createElement('table');
            tbl.style.width = '700px';
            tbl.style.border = '1px solid black';
            for (let t = 0; t < 4; t++) {
                for (let s = 0; s < 8; s++) {
                    for (let b = 0; b < 8; b++) {
                        let tr = tbl.insertRow();
                        for (let i = 0; i < 4; i++) {
                            let td = tr.insertCell();
                            switch (i) {
                                case 0:
                                    // TSB id 
                                    td.appendChild(document.createTextNode(t + "," + s + "," + b));
                                    td.style.border = '3px solid black';
                                    td.style.width = '10px';
                                    break;
                                case 1:
                                    // Available Setter 
                                    td.appendChild(document.createTextNode(sessionStorage.getItem(t + "" + s + "" + b)[0]));
                                    td.style.border = '1px solid black';
                                    td.style.width = '10px';
                                    break;
                                case 2:
                                    // TSB
                                    var tsb = (String(sessionStorage.getItem(t + "" + s + "" + b)[2]) + String(sessionStorage.getItem(t + "" + s + "" + b)[4]) + String(sessionStorage.getItem(t + "" + s + "" + b)[6]));
                                    td.appendChild(document.createTextNode(tsb));
                                    td.style.border = '1px solid black';
                                    td.style.width = '10px';
                                    break;
                                case 3:
                                    var diskData = "";
                                    for (let k = 8; k < 128; k++) {
                                        if (k % 2 == 0) {
                                            diskData = diskData + sessionStorage.getItem(t + "" + s + "" + b)[k];
                                        }
                                    }
                                    td.appendChild(document.createTextNode(diskData));
                                    td.style.border = '1px solid black';
                                    td.style.width = '10px';
                                    break;
                            }
                        }
                    }
                }
            }
            diskTable.appendChild(tbl);
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map