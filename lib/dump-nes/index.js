'use strict';

const fs = require('fs');
const path = require('path');
const NesNes = require('nesnes');

let dump = [];

function createDataSet(frame, ram, baseName) {
  const mainMemory = Array.apply([], emulator.memory.ram).join(',');
  const data = {
    frame,
    mainMemory,
  };
  dump.push(data);
  if (frame%201 === 200) {
    console.log('dumped', frame);
  }
  if ((frame%captureSize) === (captureSize-1)) {
    fs.writeFileSync('dump-' + baseName + '-' + frame + '.json', JSON.stringify(dump));
    dump = [];
    console.log('dumped', frame);
    process.exit(0);
  }
}

const romPath = process.argv[2];
const captureSize = process.argv[3] ? parseInt(process.argv[3]) : 300;
if (!romPath) {
  console.error('dump-nes [ROM PATH] [optional-frame-count-to-dump]');
  process.exit(1);
}

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
