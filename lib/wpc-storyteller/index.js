'use strict';
const fs = require('fs');
const path = require('path');
const WpcEmu = require('wpc-emu').WpcEmuApi;
const WpcEmuDB = require('wpc-emu').GamelistDB;
const serial = require('./serial');

let dump = [];

const romPath = process.argv[2];
if (!romPath) {
  console.error('dump-wpc [ROM PATH] [optional-frame-count-to-dump]');
  process.exit(1);
}
console.log('EMU-RAM-ART :: WPC CC Dumper');

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
      skipWpcRomCheck: false,
      features: wpcGameEntry.features,
    });
  }).then((wpcSystem) => {
    wpcSystem.start();

    let finished = false;
    while (!finished) {

      wpcSystem.executeCycle(1, 1);
      const cc = wpcSystem.getUiState().cpuState.regCC;
      const ticks = wpcSystem.getUiState().cpuState.tickCount

      serial.writeData({ticks,cc});
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
