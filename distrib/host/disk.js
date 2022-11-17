var TSOS;
(function (TSOS) {
    class Disk {
        constructor(track = 4, sector = 8, block = 8, innerMemory = 64) {
            this.track = track;
            this.sector = sector;
            this.block = block;
            this.innerMemory = innerMemory;
        }
    }
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=disk.js.map