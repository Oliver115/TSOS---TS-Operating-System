
module TSOS {
    export class MemoryManager {

        dataRAM: Memory;

        memoryLocations = [true, true, true]; // Memory locations 0, 1, and 2

        constructor() {
            this.dataRAM = _Memory;
        }

        /**
         * Method that writes data into RAM at specified location
         * @param wi_address = location in memory
         * @param wi_data = data to be placed in memory
         */
         writeImmediate(wi_address: number, wi_data: number) {
            this.dataRAM.setMAR(wi_address);
            this.dataRAM.setMDR(wi_data);
            this.dataRAM.write();
        }

        memoryLocationAvailable() {
            if (this.memoryLocations[0] == true) {
                return 0;
            }
            else if (this.memoryLocations[1] == true) {
                return 1;
            }
            else if (this.memoryLocations[2] == true) {
                return 2;
            }
            else {
                return 7;
            }
        }

        memoryLocationSetter(memLocation: number, free: boolean) {
            this.memoryLocations[memLocation] = free;
        }

        freeLocation(base: number, limit: number) {
            for(let i = base; i < limit; i++) {
                _MemoryManager.writeImmediate(i, "0x00");
            }
        }
    }
}