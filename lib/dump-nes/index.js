'use strict';

const fs = require('fs');
const path = require('path');
const NesNes = require('nesnes');

/*
The NES contains 2 kB of onboard work RAM. A game cartridge may contain expanded RAM to increase this amount.
*/
const DEFAULT_FRAMES_TO_DUMP = 18000;
let dump = [];

function createDataSet(frame, emudata, baseName) {
  const mainMemory = Array.apply([], emudata).join(',');
  const data = {
    frame,
    mainMemory,
  };
  dump.push(data);
  if (frame%501 === 500) {
    console.log(' dumped frame', frame);
  }
  if (frame === captureSize) {
    const filename = 'dump-' + baseName + '-' + frame + '.json';
    fs.writeFileSync(filename, JSON.stringify(dump));
    console.log('dump finished', filename);
    return true;
  }
}

const romPath = process.argv[2];
const captureSize = process.argv[3] ? parseInt(process.argv[3]) : DEFAULT_FRAMES_TO_DUMP;
if (!romPath) {
  console.error('dump-nes [ROM PATH] [optional-frame-count-to-dump]');
  process.exit(1);
}
console.log('EMU-RAM-ART :: NES Dumper');
console.log('captureSize', captureSize, 'frames');

let frame = 0;
const emulator = new NesNes();
emulator.load(romPath, () => {
  const baseName = path.basename(romPath);
  console.log('loaded rom', baseName);

  let finished = false;
  console.log('dump system memory');
  while (!finished) {
    emulator.runFrame();
    finished = createDataSet(frame, emulator.memory.ram, baseName);
    frame++;
  }

  // we could dump the VRAM too (2k) - but it's rather boring
/*  finished = false;
  frame = 0;
  dump = [];
  console.log('dump video memory');
  while (!finished) {
    emulator.runFrame();
    finished = createDataSet(frame, emulator.ppu.ram, 'ppu' + baseName);
    frame++;
  }*/
});
