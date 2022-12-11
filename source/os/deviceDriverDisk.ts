/* ----------------------------------
   DeviceDriverDisk.ts

   The Kernel Disk Device Driver.
   ---------------------------------- */

   module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverDisk extends DeviceDriver {

        format_flag = false;

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnDrDriverEntry;
        }

        public krnDrDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        is_format() {
            if (this.format_flag) {
                return true;
            }
            else {
                return false;
            }
        }

        nuke(location: string) {
            var value = "1---";
            for(let i = 4; i < 64; i++) {
                value = value + "~";
            }
            sessionStorage.setItem(location, value);
        }

        format() {
            // track
            for(let t = 0; t < _Disk.track; t++) {
                // sector
                for(let s = 0; s < _Disk.sector; s++) {
                    // block
                    for(let b = 0; b < _Disk.block; b++) {
                        var key: string = (t + "" + s + "" + b);

                        var value = [];
                        for(let k = 0; k < 4; k++) {
                            value[k] = 0;
                        }
                        for(let j = 4; j < 64; j++) {
                            value[j] = "~";
                        }

                        // could re-write this method to use a string instead of an array... but nah
                        var data = "";
                        if ((t == 0) && (s == 0) && (b == 0)) {
                            value[0] = 1;
                            data = String(value).replaceAll(',', '');
                            sessionStorage.setItem(key, data);
                        }
                        else if (t > 0) {
                            value[1] = "-"; value[2] = "-"; value[3] = "-";
                            data = String(value).replaceAll(',', '');
                            sessionStorage.setItem(key, data);
                        }
                        else {
                            data = String(value).replaceAll(',', '');
                            sessionStorage.setItem(key, data);
                        }
                    }
                }
            }
            var diskView = document.getElementById("diskHead");
                            diskView.innerHTML = "Disk";
            _StdOut.putText("Disk Formatted");
            this.updateDiskView();

            this.format_flag = true;
        }

        updateDiskView() {
            document.getElementById("tableDisk").innerHTML = "";

            let diskTable = document.getElementById('tableDisk'); 
            let tbl  = document.createElement('table');
            tbl.style.width  = '700px';
            tbl.style.border = '1px solid black';

            // Create table headers
            let thead = tbl.createTHead();
            let row = thead.insertRow();
            var text;
                for (let i = 0; i < 4; i++) {
                    let th = document.createElement("th");
                    switch(i) {
                        case 0:
                            text = document.createTextNode("Key");
                            break;
                        case 1:
                            text = document.createTextNode("Available");
                            break;
                        case 2:
                            text = document.createTextNode("TSB");
                            break;
                        case 3:
                            text = document.createTextNode("Data");
                            break;
                    }
                    th.appendChild(text);
                    row.appendChild(th);
                }

            // Rest of Table
            for(let t = 0; t < 4; t++) {
                for(let s = 0; s < 8; s++) {
                    for(let b = 0; b < 8; b++) {

                        let tr = tbl.insertRow();

                        for(let i = 0; i < 4; i++) {
                            let td = tr.insertCell();

                            switch(i) {
                                case 0:
                                    // TSB id 
                                    td.appendChild(document.createTextNode(t + "," + s + "," + b));
                                    td.style.border = '1px solid black';
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
                                    var tsb = (String(sessionStorage.getItem(t + "" + s + "" + b)[1]) + String(sessionStorage.getItem(t + "" + s + "" + b)[2]) + 
                                               String(sessionStorage.getItem(t + "" + s + "" + b)[3]));
                                    td.appendChild(document.createTextNode(tsb));
                                    td.style.border = '1px solid black';
                                    td.style.width = '10px';
                                    break;
                                    // Data
                                case 3:
                                    var diskData = "";
                                    for(let k = 4; k < 64; k++) {
                                        diskData = diskData + sessionStorage.getItem(t + "" + s + "" + b)[k];
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

        findNext_DIR() {
            // track will always be 0. Thus, track is not needed here
            // sector 
            for(let s = 0; s < _Disk.sector; s++) {
                // block
                for(let b = 0; b < _Disk.block; b++) {

                    // Is this location free?
                    if (sessionStorage.getItem("0" + s +  "" + b)[0] === "0") {
                        return ("0" + s + "" + b);
                    }
                }
            } 
        }

        findNext_DATA() {
            // track
            for(let t = 1; t < _Disk.track; t++) {
                // sector
                for(let s = 0; s < _Disk.sector; s++) {
                    // block
                    for(let b = 0; b < _Disk.block; b++) {
                        // Is this location free?
                        if (sessionStorage.getItem(t + "" + s + "" + b)[0] === "0") {
                            return (t + "" + s + "" + b);
                        }
                    }
                } 
            } 
        }

        encode(text: string) {
            var encoded_data = "";

            for(let i = 4; i < 64; i++) {
                if (text.length > (i - 4)) {
                    // ABC to ASCII to Hex
                    encoded_data = encoded_data + text.charCodeAt(i - 4).toString(16);
                }
                else {
                    encoded_data = encoded_data + "~";
                }
            }
            return encoded_data; 
        }

        createFile(filename: string) {
            var new_data = this.encode(filename);

            // check if filename already exists
            if (this.checkFilename(new_data, 0) === "0") {
                _StdOut.putText("Filename already exists");
            }
            else {
                new_data = ("1" + this.findNext_DATA() + new_data);
                sessionStorage.setItem(this.findNext_DIR(), new_data);

                // Flag DATA location as used
                var data = sessionStorage.getItem(this.findNext_DATA());
                data = data.replace("0", "1");
                sessionStorage.setItem(this.findNext_DATA(), data);

                this.updateDiskView();

                _StdOut.putText("File with name '" + filename + "' created");
            }
        }

        checkFilename(filename: string, returnLocation) {
            var flag = -1;
            for(let s = 0; s < _Disk.sector; s++) {
                // block
                for(let b = 0; b < _Disk.block; b++) {
                    // Is this location free?
                    if (sessionStorage.getItem("0" + s +  "" + b)[0] === "1") {
                        flag = filename.localeCompare(sessionStorage.getItem("0" + s + "" + b).substring(4));
                        if (flag == 0) {
                            if (returnLocation == 0) {
                                // File does exist
                                return "0";
                            }
                            if (returnLocation == 1) {
                                // reaturn location of where file is located
                                return (sessionStorage.getItem("0" + s + "" + b)[1] + sessionStorage.getItem("0" + s + "" + b)[2] + 
                                sessionStorage.getItem("0" + s + "" + b)[3]);
                            }
                        }
                    }
                }
            } 
            // Not found
            return "1";
        }

        write(name: string, text: string) {
            var encoded_name = this.encode(name);

            // check if file exists
            if (this.checkFilename(encoded_name, 0) === "1") {
                _StdOut.putText("File " + name + " was not found");
            }
            else {
                // Get location of file on Disk 
                var fileLocation = this.checkFilename(encoded_name, 1);

                // check to see if 
                if (text.length > 59) {
                    var temp_text = ""; var start = 0; var end = 59;
                    for (let i = -1; i <= (Math.floor(59 / (text.length - 1))); i++) {

                        if (end < (text.length - 1)) {
                            temp_text = text.substring(start, end);
                            start = start + 59; end = end + 59;

                            sessionStorage.setItem(fileLocation, ("1" + this.findNext_DATA() + this.encode(temp_text)));
                        } 
                        else {
                            temp_text = text.substring(start, (text.length - 1));
                            sessionStorage.setItem(this.findNext_DATA(), ("1---" + this.encode(temp_text)));
                            this.updateDiskView(); 
                            _StdOut.putText("File '" + name + "' has been updated" );
                        }
                    }
                }
                // means that text or data fits in one single location
                else {
                    var encoded_text = "";
                    for(let k = 0; k < text.length; k++) {
                        encoded_text = encoded_text + text.charCodeAt(k).toString(16);
                    }
                    // write text to location in DATA
                    sessionStorage.setItem(fileLocation, ("1---" + this.encode(text)));
                    this.updateDiskView(); 
                    _StdOut.putText("File '" + name + "' has been updated" );
                }
            }
        }

        read(name: string) {
            var inside_name = this.encode(name);

            // check if file exists
            if (this.checkFilename(inside_name, 0) === "1") {
                _StdOut.putText("File " + name + " was not found");
            }
            // File does exists - go an read its contents 
            else {
                // flag for while loop
                var flag = true;

                var location = this.checkFilename(inside_name, 1);
                var fileData = ""

                while (flag) {
                    if (this.decodeRead(location)[1] != "---") {

                        fileData = fileData + this.decodeRead(location)[0];
                        location = this.decodeRead(location)[1];
                    }
                    else {
                        fileData = fileData + this.decodeRead(location)[0];
                        location = this.decodeRead(location)[1];
                        flag = false;
                    }
                }
                _StdOut.putText(fileData);
            }
        }
        decodeRead(ubicacion: string) {
            var file_text = sessionStorage.getItem(ubicacion).substring(4);
            var next_location = sessionStorage.getItem(ubicacion).substring(1, 4);

            var decoded_text = "";
                for(let i = 0; i < file_text.length; i++) {

                    if (file_text.charAt(i) != "~") {
                        let lol = file_text.charAt(i) + file_text.charAt(i + 1);

                        decoded_text = decoded_text + String.fromCharCode(parseInt(lol, 16));
                        i = i + 1;
                    }
                }
                return [decoded_text, next_location];
        }
    }
}