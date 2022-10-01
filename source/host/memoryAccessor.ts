
module TSOS {
    export class MemoryAccessor {

        dataRAM: Memory;

        constructor() {
        }

        public init(): void {
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


        /**
         * Method that takes in a number and converts it into hexadecimal 
         * @param number_to_convert = number that will be converted into hexdecimal
         * @param number_of_zeros = number of zeros to be padded in front of the number
         * @const hex_map = string that contains all 15 hexadecimal digits
         * @return properly formatted hexadecimal number (example. 005C or 023F)
         * 
         */
         hexLog(number_to_convert: number, number_of_zeros: number) {

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
        padLeft(text: string, padChar: string, size: number): string {
            return (String(padChar).repeat(size) + text).substr( (size * -1), size);
        }


        /**
         * Method that takes the MAR and updates its low order byte
         * @param lob = value to be replaced into MAR's low order byte 
         * @return MAR with the updated low order byte
         */
        setLowOrderByte(lob: number) {
            var low = this.hexLog(lob, 2);
            var low_split = low.split('', 2);

            var mar = this.hexLog(0, 4);
            var mar_split = mar.split('' , 4);

            mar_split[2] = low_split[0];
            mar_split[3] = low_split[1];

            mar = mar_split.join("");
            mar = ("0x" + mar);
        
            var final_mar = parseInt(mar);
            return final_mar;
        }

        /**
         * Method that takes the MAR and updates its high order byte
         * @param hob = value to be replaced into MAR's high order byte
         * @return MAR with the updated high order byte
         */
        setHighOrderByte(hob: number, counter : number) {
            var high = this.hexLog(hob, 2);
            var high_split = high.split('', 2);

            var mar = this.hexLog(counter, 4);
            var mar_split = mar.split('' , 4);

            mar_split[0] = high_split[0];
            mar_split[1] = high_split[1];
            
            mar = mar_split.join("");
            mar = ("0x" + mar);

            var final_mar = parseInt(mar);
            return final_mar;
        }

        /**
         * Method that gets an address and puts it into the MAR. The MMU then reads this address (the MDR gets the value of the memory location speficied by the parameter)
         * @param address = memory address that will be placed in the MAR
         */
        readMMU(address : number) {
            this.dataRAM.setMAR(address);
            this.dataRAM.read();
        }

        /**
         * Method that writes a value to memory at a speficied location
         * @param address = memory address that will be placed in the MAR
         * @param value_to_store = value that will be stored at the location in memory specified by the 'address' parameter
         */
        writeMMU(address : number, value_to_store : number) {
            this.dataRAM.setMAR(address);
            this.dataRAM.setMDR(value_to_store);
            this.dataRAM.write();
        }

        /**
         * Method that gets the value in the MDR
         * @returns the value in the MDR
         */
        getMDR_MMU() {
            return this.dataRAM.getMDR();
        }
    }
}