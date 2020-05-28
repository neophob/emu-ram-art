'use strict';
const fs = require('fs');
const path = require('path');
const WpcEmu = require('wpc-emu').WpcEmuApi;

// The WPC contains 8 kB of RAM
const DEFAULT_FRAMES_TO_DUMP = 6000;
const HALF_SECOND_TICKS = 1000000;
const CPU_STEPS = 64;

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
if (!romPath) {
  console.error('dump-wpc [ROM PATH] [optional-frame-count-to-dump]');
  process.exit(1);
}
const captureSize = process.argv[3] ? parseInt(process.argv[3]) : DEFAULT_FRAMES_TO_DUMP;
console.log('EMU-RAM-ART :: WPC Dumper');
console.log('captureSize', captureSize, 'frames');

let frame = 0;
const baseName = path.basename(romPath);

loadFile(romPath)
  .then((u06Rom) => {
    console.log('loaded rom', baseName);
    const romData = {
      u06: u06Rom,
    };
    return WpcEmu.initVMwithRom(romData, {
      fileName: 'foo',
      skipWpcRomCheck: true,
      features: ['wpcFliptronics'],
    });
  }).then((wpcSystem) => {
    wpcSystem.start();

//    wpcSystem.executeCycle(HALF_SECOND_TICKS * 8, CPU_STEPS);
//    wpcSystem.setCabinetInput(16);

    let finished = false;
    while (!finished) {
      //the output file assumes 60 frames per second
      const cycles = 66666;//33333;
      wpcSystem.executeCycle(cycles, CPU_STEPS);
      const ram = wpcSystem.getUiState().asic.ram;
      finished = createDataSet(frame, ram, baseName);
      frame++;
    }
  });

function loadFile(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, (error, data) => {
      if (error) {
        return reject(error);
      }
      resolve(new Uint8Array(data));
    });
  });
}
