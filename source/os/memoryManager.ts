
module TSOS {
    export class MemoryManager {

        dataRAM: Memory;

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
    }

}