'use strict';

const fs = require('fs');
const path = require('path');
const NesNes = require('nesnes');

const DEFAULT_FRAMES_TO_DUMP = 18000;
let dump = [];

function createDataSet(frame, ram, baseName) {
  const mainMemory = Array.apply([], emulator.memory.ram).join(',');
  const data = {
    frame,
    mainMemory,
  };
  dump.push(data);
  if (frame%201 === 200) {
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
console.log('EMU-RAM-ART :: Dumper');
console.log('captureSize', captureSize, 'frames');

let frame = 0;
const emulator = new NesNes();
emulator.load(romPath, () => {
  const baseName = path.basename(romPath);
  console.log('loaded rom', baseName);
  while (true) {
    emulator.runFrame();
    createDataSet(frame++, emulator, baseName);
  }
});
