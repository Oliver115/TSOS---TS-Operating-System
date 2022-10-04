/* ------------
     memory.ts

     Most of the code is copied from my final project developed for Prof. Gormanly's Org and Arch course
     Github repo: https://github.com/Oliver115/422-tsiraM (repo is private :) )
     ------------ */
module TSOS {
    export class Memory {

        constructor(public RAM: number[] = Array(0xFF).fill(0x00), // More space will be allocated later
                    public MAR: number = 0x0000,
                    public MDR: number = 0x00) {
        }

        public init(): void {
            this.RAM = Array(0xFF).fill(0x00); // More space will be allocated later
            this.MAR = 0x0000;
            this.MDR = 0x00;
        }

        public show(): void {
            console.log(this.RAM);
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
         * Method that loads the MDR with the data from memory specified by the MAR
         */
        read() {
            this.MDR = this.RAM[this.MAR];
        }

        /**
         * Method that stores MDR into location in memory specified by the MAR
         */
        write() {
            this.RAM[this.MAR] = this.MDR;
        }

        /**
         * Method that sets the MAR with a specified value
         * @param set_MAR = value to be placed into the MAR
         */
        setMAR(set_MAR: number) { 
            this.MAR = set_MAR;
        }

        /**
         * Method that returns the value/number in the MAR
         * @return value in the MAR
         */
        getMAR() { return this.MAR; }

        /**
         * Method that sets the MDR with a specified value
         * @param set_MDR = value to be placed into the MDR
         */
        setMDR(set_MDR: number) { 
            this.MDR = set_MDR;
        }

        /**
         * Method that returns the value/number in the MDR
         * @return value in the MDR
         */
        getMDR() { return this.MDR; }
    } 
}