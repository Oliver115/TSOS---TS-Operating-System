module TSOS {
        export class Disk {
    
            constructor(public track: number = 4, 
                        public sector: number = 8,
                        public block: number = 8,
                        public innerMemory: number = 64) {
            }
        } 
    }