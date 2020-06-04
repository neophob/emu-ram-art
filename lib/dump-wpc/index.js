'use strict';
const fs = require('fs');
const path = require('path');
const WpcEmu = require('wpc-emu').WpcEmuApi;
const WpcEmuDB = require('wpc-emu').GamelistDB;

// The WPC contains 8 kB of RAM
const DEFAULT_FRAMES_TO_DUMP = 6000;
const HALF_SECOND_TICKS = 1000000;
const CPU_STEPS = 64;

let dump = [];

function createDataSet(frame, emudata, baseName, framesPerSecond, gameName) {
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
    const dumpV2 = {
      version: 2,
      filename: gameName,
      framesPerSecond,
      dump,
    }
    fs.writeFileSync(filename, JSON.stringify(dumpV2));
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
console.log('EMU-RAM-ART :: WPC Memory Dumper');
console.log('captureSize', captureSize, 'frames');

let frame = 0;
const baseName = path.basename(romPath);

const wpcGameEntryName = WpcEmuDB.getAllNames().filter((entry) => {
  const game = WpcEmuDB.getByName(entry);
  if (baseName.toLowerCase() === game.rom.u06.toLowerCase()) {
    return true;
  }

  if (!game.pinmame) {
    return false;
  }

  const alternativeNamesArray = game.pinmame.knownNames.filter((pinmameName) => {
    const pinmameNameLower = pinmameName.toLowerCase();
    return baseName.startsWith(pinmameNameLower);
  });
  return alternativeNamesArray.length > 0;
})[0];

if (!wpcGameEntryName) {
  console.error('UNKNOWN ROM File', baseName);
  process.exit(1);
}

console.log('load game entry', wpcGameEntryName);
const wpcGameEntry = WpcEmuDB.getByName(wpcGameEntryName);

loadFile(romPath)
  .then((u06Rom) => {
    console.log('loaded rom', baseName, wpcGameEntry.features);
    const romData = {
      u06: u06Rom,
    };
    return WpcEmu.initVMwithRom(romData, {
      fileName: baseName,
      skipWpcRomCheck: true,
      features: wpcGameEntry.features,
    });
  }).then((wpcSystem) => {
    wpcSystem.start();

    wpcSystem.executeCycle(HALF_SECOND_TICKS * 8, CPU_STEPS);
    wpcSystem.setCabinetInput(16);

    let finished = false;
    while (!finished) {
      //the output file assumes 60 frames per second
      const cycles = 66666;//33333;
      wpcSystem.executeCycle(cycles, CPU_STEPS);
      const ram = wpcSystem.getUiState().asic.ram;
      finished = createDataSet(frame, ram, baseName, 2000000 / cycles, wpcGameEntryName);

      //const vram = wpcSystem.getUiState().asic.dmd.videoOutputBuffer;
      //finished = createDataSet(frame, vram, baseName + 'VRAM', 2000000 / cycles, wpcGameEntryName + ' VRAM');
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
