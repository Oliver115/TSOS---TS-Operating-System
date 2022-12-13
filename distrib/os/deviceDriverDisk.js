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
            this.format_flag = false;
            this.driverEntry = this.krnDrDriverEntry;
        }
        krnDrDriverEntry() {
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
        nuke(location) {
            var value = "0---";
            for (let i = 4; i < 64; i++) {
                value = value + "~";
            }
            sessionStorage.setItem(location, value);
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
                        // could re-write this method to use a string instead of an array... but nah
                        var data = "";
                        if ((t == 0) && (s == 0) && (b == 0)) {
                            value[0] = 1;
                            data = String(value).replaceAll(',', '');
                            sessionStorage.setItem(key, data);
                        }
                        else if (t > 0) {
                            value[1] = "-";
                            value[2] = "-";
                            value[3] = "-";
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
            let tbl = document.createElement('table');
            tbl.style.width = '700px';
            tbl.style.border = '1px solid black';
            // Create table headers
            let thead = tbl.createTHead();
            let row = thead.insertRow();
            var text;
            for (let i = 0; i < 4; i++) {
                let th = document.createElement("th");
                switch (i) {
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
                                    for (let k = 4; k < 64; k++) {
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
            for (let s = 0; s < _Disk.sector; s++) {
                // block
                for (let b = 0; b < _Disk.block; b++) {
                    // Is this location free?
                    if (sessionStorage.getItem("0" + s + "" + b)[0] === "0") {
                        return ("0" + s + "" + b);
                    }
                }
            }
        }
        findNext_DATA() {
            // track
            for (let t = 1; t < _Disk.track; t++) {
                // sector
                for (let s = 0; s < _Disk.sector; s++) {
                    // block
                    for (let b = 0; b < _Disk.block; b++) {
                        // Is this location free?
                        if (sessionStorage.getItem(t + "" + s + "" + b)[0] === "0") {
                            return (t + "" + s + "" + b);
                        }
                    }
                }
            }
        }
        encode(text) {
            var encoded_data = "";
            for (let i = 4; i < 64; i++) {
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
        createFile(filename) {
            var new_data = this.encode(filename);
            // check if filename already exists
            if (this.checkFilename(new_data, 0) === "0") {
                _StdOut.putText("Filename already exists");
            }
            else {
                new_data = ("1" + this.findNext_DATA() + new_data);
                sessionStorage.setItem(this.findNext_DIR(), new_data);
                // Flag DATA location as 'unavailable'
                var data = sessionStorage.getItem(this.findNext_DATA());
                data = data.replace("0", "1");
                sessionStorage.setItem(this.findNext_DATA(), data);
                this.updateDiskView();
                _StdOut.putText("File with name '" + filename + "' created");
            }
        }
        /**
         * @param returnLocation 0: looking if file exists (should return 0 if found).
         *        returnLocation 1: looking for location in DATA of file (should return the location in DATA "1--").
         *        returnLocation 2: looking for location in DIR of file (should return location in DIR "0--").
         * @returns 1 if File was not founds anywhere
         */
        checkFilename(filename, returnLocation) {
            var flag = -1;
            for (let s = 0; s < _Disk.sector; s++) {
                // block
                for (let b = 0; b < _Disk.block; b++) {
                    // Is this location free?
                    if (sessionStorage.getItem("0" + s + "" + b)[0] === "1") {
                        flag = filename.localeCompare(sessionStorage.getItem("0" + s + "" + b).substring(4));
                        if (flag == 0) {
                            if (returnLocation == 0) {
                                // File does exist
                                return "0";
                            }
                            if (returnLocation == 1) {
                                // return location of where file is located
                                return (sessionStorage.getItem("0" + s + "" + b)[1] + sessionStorage.getItem("0" + s + "" + b)[2] +
                                    sessionStorage.getItem("0" + s + "" + b)[3]);
                            }
                            if (returnLocation == 2) {
                                // return location of file in DIR 
                                return ("0" + s + "" + b);
                            }
                        }
                    }
                }
            }
            // Not found
            return "1";
        }
        write(name, text, isItCopy) {
            var encoded_name = this.encode(name);
            // check if file exists
            if (this.checkFilename(encoded_name, 0) === "1") {
                _StdOut.putText("File " + name + " was not found");
            }
            else {
                // Get location of file on Disk 
                var fileLocation = this.checkFilename(encoded_name, 1);
                // check to see if more that one segment is needed
                if (text.length > 60) {
                    var temp_text = "";
                    var start = 0;
                    var end = 60;
                    for (let i = -1; i <= (Math.floor(text.length / 60)); i++) {
                        if (end < (text.length - 1)) {
                            temp_text = text.substring(start, end);
                            start = start + 60;
                            end = end + 60;
                            sessionStorage.setItem(fileLocation, ("1" + this.findNext_DATA() + this.encode(temp_text)));
                            fileLocation = this.findNext_DATA();
                            // Flag DATA location as 'unavailable'
                            var data = sessionStorage.getItem(this.findNext_DATA());
                            data = data.replace("0", "1");
                            sessionStorage.setItem(this.findNext_DATA(), data);
                        }
                        else {
                            temp_text = text.substring(start, (text.length - 1));
                            sessionStorage.setItem(fileLocation, ("1---" + this.encode(temp_text)));
                            this.updateDiskView();
                            if (isItCopy == false) {
                                _StdOut.putText("File '" + name + "' has been updated");
                            }
                        }
                    }
                }
                // means that text or data fits in one single location
                else {
                    var encoded_text = "";
                    for (let k = 0; k < text.length; k++) {
                        encoded_text = encoded_text + text.charCodeAt(k).toString(16);
                    }
                    // write text to location in DATA
                    sessionStorage.setItem(fileLocation, ("1---" + this.encode(text)));
                    this.updateDiskView();
                    if (isItCopy == false) {
                        _StdOut.putText("File '" + name + "' has been updated");
                    }
                }
            }
        }
        read(name) {
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
                var fileData = "";
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
        decodeRead(ubicacion) {
            var file_text = sessionStorage.getItem(ubicacion).substring(4);
            var next_location = sessionStorage.getItem(ubicacion).substring(1, 4);
            var decoded_text = "";
            for (let i = 0; i < file_text.length; i++) {
                if (file_text.charAt(i) != "~") {
                    let lol = file_text.charAt(i) + file_text.charAt(i + 1);
                    decoded_text = decoded_text + String.fromCharCode(parseInt(lol, 16));
                    i = i + 1;
                }
            }
            return [decoded_text, next_location];
        }
        delete(file_to_kill, msg) {
            var encoded_kill = this.encode(file_to_kill);
            // check if file exists
            if (this.checkFilename(encoded_kill, 0) === "1") {
                _StdOut.putText("File " + file_to_kill + " was not found");
            }
            else {
                // Get location of file on Disk 
                var fileLocation = this.checkFilename(encoded_kill, 1);
                // delete filename in DIR
                this.nuke(this.checkFilename(encoded_kill, 2));
                var flag = true;
                var toNuke;
                while (flag) {
                    if (this.decodeRead(fileLocation)[1] != "---") {
                        toNuke = fileLocation;
                        fileLocation = this.decodeRead(fileLocation)[1];
                        this.nuke(toNuke);
                    }
                    else {
                        this.nuke(fileLocation);
                        flag = false;
                    }
                }
                this.updateDiskView();
                if (msg) {
                    _StdOut.putText("File '" + file_to_kill + "' was deleted along with its data");
                }
            }
        }
        rename(oldname, newname) {
            var old = this.encode(oldname);
            if (this.checkFilename(old, 0) === "1") {
                _StdOut.putText("File " + oldname + " was not found");
            }
            else {
                var newLocation = this.checkFilename(old, 2);
                var new_name = sessionStorage.getItem(newLocation)[0] + sessionStorage.getItem(newLocation)[1] +
                    sessionStorage.getItem(newLocation)[2] + sessionStorage.getItem(newLocation)[3] + this.encode(newname);
                sessionStorage.setItem(newLocation, new_name);
            }
            _StdOut.putText(oldname + " was renamed to: " + newname);
            this.updateDiskView();
        }
        ls() {
            // count files in case there aren't any
            var count = 0;
            for (let s = 0; s < _Disk.sector; s++) {
                // block
                for (let b = 0; b < _Disk.block; b++) {
                    // Does this location have a filename?
                    if ((sessionStorage.getItem("0" + s + "" + b)[0] === "1")) {
                        if ((s == 0) && (b == 0)) {
                            // do nothing
                        }
                        else {
                            if (count == 0) {
                                _StdOut.putText("Files on Disk: ");
                                _StdOut.advanceLine();
                                _StdOut.putText("- " + this.decodeRead("0" + s + "" + b)[0]);
                                _StdOut.advanceLine();
                                count++;
                            }
                            else {
                                _StdOut.putText("- " + this.decodeRead("0" + s + "" + b)[0]);
                                _StdOut.advanceLine();
                                count++;
                            }
                        }
                    }
                }
            }
            if (count == 0) {
                _StdOut.putText("No files on disk :(");
            }
        }
        copy(file_to_copy) {
            var copy = this.encode(file_to_copy);
            // Does a copy already exist?
            if (this.checkFilename((this.encode((file_to_copy + "Copy"))), 0) === "0") {
                _StdOut.putText("A copy of '" + file_to_copy + "' already exists.");
            }
            // Does a the file exist?
            else if (this.checkFilename(copy, 0) === "1") {
                _StdOut.putText("File " + file_to_copy + " was not found");
            }
            else {
                var file = file_to_copy + "Copy";
                // create file in DIR
                this.createFile(file);
                // Read contents of file 
                var flag = true;
                var location = this.checkFilename(copy, 1);
                var fileData = "";
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
                // place contents of file in new location in DATA
                this.write(file, fileData, true);
            }
        }
        encodeFromMem(data) {
            var encoded_data = data;
            for (let i = (data.length - 1); i < 60; i++) {
                encoded_data = encoded_data + "~";
            }
            //console.log(encoded_data);
            return encoded_data;
        }
        createFromMem(pid, data) {
            console.log("Into Disk: " + pid);
            data = data.toLowerCase();
            var encodedPID = this.encode(pid);
            // Add pid to DIR (create File)
            var pidLocation = ("1" + this.findNext_DATA() + encodedPID);
            sessionStorage.setItem(this.findNext_DIR(), pidLocation);
            // Set data loaction as unavailable
            var temp = sessionStorage.getItem(this.findNext_DATA());
            temp = temp.replace("0", "1");
            sessionStorage.setItem(this.findNext_DATA(), temp);
            this.updateDiskView();
            // (Write)
            // Get location of file on Disk 
            var fileLocation = this.checkFilename(encodedPID, 1);
            // check to see if more that one segment is needed
            if (data.length > 60) {
                var temp_text = "";
                var start = 0;
                var end = 60;
                for (let i = 0; i <= (Math.floor(data.length / 60)); i++) {
                    if (end < (data.length - 1)) {
                        //console.log("Long");
                        temp_text = data.substring(start, end);
                        start = start + 60;
                        end = end + 60;
                        sessionStorage.setItem(fileLocation, ("1" + this.findNext_DATA() + this.encodeFromMem(temp_text)));
                        fileLocation = this.findNext_DATA();
                        // Flag DATA location as 'unavailable'
                        var door = sessionStorage.getItem(this.findNext_DATA());
                        door = door.replace("0", "1");
                        sessionStorage.setItem(this.findNext_DATA(), door);
                    }
                    else {
                        //console.log("Short");
                        temp_text = data.substring(start, (data.length));
                        sessionStorage.setItem(fileLocation, ("1---" + this.encodeFromMem(temp_text)));
                        this.updateDiskView();
                    }
                }
            }
            // means that text or data fits in one single location
            else {
                // write data to location in DATA
                sessionStorage.setItem(fileLocation, ("1---" + this.encodeFromMem(data)));
                this.updateDiskView();
            }
            this.updateDiskView();
        }
        // Only used for swapping
        decodeReadForMemory(ubicacion) {
            var file_text = sessionStorage.getItem(ubicacion).substring(4);
            var next_location = sessionStorage.getItem(ubicacion).substring(1, 4);
            var lol = "";
            for (let i = 0; i < file_text.length; i++) {
                if (file_text.charAt(i) != "~") {
                    lol = lol + file_text.charAt(i);
                }
            }
            return [lol, next_location];
        }
        readForMem(pid) {
            console.log("Out of Disk: " + pid);
            var pidEncoded = this.encode(pid);
            var pidLocation = this.checkFilename(pidEncoded, 1);
            var flag = true;
            var fileData = "";
            while (flag) {
                if (this.decodeReadForMemory(pidLocation)[1] != "---") {
                    fileData = fileData + this.decodeReadForMemory(pidLocation)[0];
                    pidLocation = this.decodeReadForMemory(pidLocation)[1];
                }
                else {
                    fileData = fileData + this.decodeReadForMemory(pidLocation)[0];
                    pidLocation = this.decodeReadForMemory(pidLocation)[1];
                    flag = false;
                }
            }
            fileData = fileData.replaceAll(" ", "");
            // load hex code into memory
            const hex_for_appending = "0x";
            var program = [];
            for (let j = 0; j < fileData.length; j++) {
                var temp_var = parseInt((hex_for_appending + fileData.charAt(j) + fileData.charAt(j + 1)), 16);
                program.push(temp_var);
                j++;
            }
            this.updateDiskView();
            return program;
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map