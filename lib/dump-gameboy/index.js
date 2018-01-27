'use strict';

const fs = require('fs');
const path = require('path');
const Gameboy = require('node-gameboy');

// 8 KByte RAM Area

const DEFAULT_FRAMES_TO_DUMP = 9000;
let dump = [];

function createDataSet(frame, mainMemory, baseName) {
 const data = {
   frame,
   mainMemory: mainMemory.join(','),
 };
 dump.push(data);
 if (frame%500 === 499) {
   console.log('dumped frame', frame);
 }
 if (frame === captureSize) {
   fs.writeFileSync('dump-' + baseName + '-' + frame + '.json', JSON.stringify(dump));
   dump = [];
   console.log('dump finished, exit now...');
   process.exit(0);
 }
}

const romPath = process.argv[2];
const captureSize = process.argv[3] ? parseInt(process.argv[3]) : DEFAULT_FRAMES_TO_DUMP;
if (!romPath) {
 console.error('dump-nes [ROM PATH] [optional-frame-count-to-dump]');
 process.exit(1);
}
console.log('EMU-RAM-ART :: GameBoy Dumper');
console.log('captureSize', captureSize, 'frames');
const baseName = path.basename(romPath);

let frame = 0;
const gameboy = new Gameboy();
const romData = fs.readFileSync(romPath);
gameboy.loadCart(romData);
console.log('loaded rom', baseName);
gameboy._init();

while (true) {
 gameboy._cpu._step();
 createDataSet(frame++, gameboy._mmu._wram, baseName);
}
