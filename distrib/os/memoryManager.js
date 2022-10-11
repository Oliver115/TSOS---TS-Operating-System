var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
            this.dataRAM = _Memory;
        }
        /**
         * Method that writes data into RAM at specified location
         * @param wi_address = location in memory
         * @param wi_data = data to be placed in memory
         */
        writeImmediate(wi_address, wi_data) {
            this.dataRAM.setMAR(wi_address);
            this.dataRAM.setMDR(wi_data);
            this.dataRAM.write();
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map