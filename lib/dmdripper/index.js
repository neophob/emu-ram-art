'use strict';

// env DEBUG="dmdripper:index" ROMFILE=./rom/FSHTL_5.ROM node lib/dmdripper/index.js

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createCanvas } = require('canvas');
const Emulator = require('wpc-emu').WpcEmuApi;
const debug = require('debug')('dmdripper:index');
const template = require('./layout');
const wpc = require('./wpc');

const BIT_ARRAY = [1, 2, 4, 8, 16, 32, 64, 128];
const HALF_SECOND_TICKS = 10000000;
const KEYPRESS_TICKS = 1;
//const KEYPRESS_TICKS = 100000;
const CPU_STEPS = 16;

//PLUMB BOB TILT, SLAM TILT and COIN DOOR OPEN switch are blacklisted
const blacklistSwitch = process.env.BLACKLISTSW || '14,21,22';
const romU06Path = process.env.ROMFILE || path.join(__dirname, '/../../rom/t2_l8.rom');
let ramState;
try {
  if (process.env.RAMFILE) {
    debug('RAM STATE', process.env.RAMFILE)
    ramState = require(process.env.RAMFILE);
    debug('RAM STATE LOADED')
  }
} catch (_error) {
  debug('RAM STATE NOT FOUND', _error)
}

const baseName = path.basename(romU06Path);

const wpcGameEntry = wpc.getDbEntry(baseName);

console.log('wpcGameEntry.initialise',wpcGameEntry.initialise.closedSwitches)
const switchBlacklist = blacklistSwitch.split(',').map((n) => parseInt(n, 10));
debug('switchBlacklist',switchBlacklist);
const TEMPLATE = template.LAYOUT.v5;
if (wpcGameEntry.cabinetColors) {
  TEMPLATE.colorDmdForeground = wpcGameEntry.cabinetColors;
  TEMPLATE.colorDmdForeground.push('#ffffff');
}

const dmdFramesTotal = TEMPLATE.dmdFramesHorizontal * TEMPLATE.dmdFramesVertical;
const dmdFrameWidthMargin = TEMPLATE.dmdFrameWidth + TEMPLATE.dmdFrameMargin;
const dmdFrameHeightMargin = TEMPLATE.dmdFrameHeight + TEMPLATE.dmdFrameMargin;
const canvasWidth = TEMPLATE.margin * 2 + TEMPLATE.dmdFramesHorizontal * dmdFrameWidthMargin - TEMPLATE.dmdFrameMargin;
const canvasHeight = TEMPLATE.margin * 2 + TEMPLATE.dmdFramesVertical * dmdFrameHeightMargin - TEMPLATE.dmdFrameMargin;
const imgChecksum = new Set();
let xpos = TEMPLATE.margin;
let ypos = TEMPLATE.margin;
let addedImages = 0;

let gameNotRunningcount = 0;
let lastScreen = -1;
let gameIsRunning = false;
let currentScreen, state;

const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext('2d');
ctx.fillStyle = TEMPLATE.backgroundColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

ripDmdFrames();

function drawDmd(c, data, x, y, width) {
  c.fillStyle = TEMPLATE.colorDmdBackground;
  c.fillRect(x, y, width, 32);

  let randomColor = parseInt(0.5 + Math.random() * (TEMPLATE.colorDmdForeground.length - 1), 10);
  c.fillStyle = alternateColor(TEMPLATE.colorDmdForeground[randomColor], 32);

  var offsetX = 0;
  var offsetY = 0;
  for (var i = 0; i < data.length; i++) {
    const packedByte = data[i];
    for (var j = 0; j < BIT_ARRAY.length; j++) {
      if (packedByte > 0) {
        const mask = BIT_ARRAY[j];
        if (mask & packedByte) {
          c.fillRect(x + offsetX, y + offsetY, 1, 1);
        }
      }
      offsetX++;
      if (offsetX === width) {
        offsetX = 0;
        offsetY++;
      }
    }
  }
}

function extractDmdFramesAndEventuallyQuit(status) {
  if (!status || typeof status.asic.dmd.videoRam !== 'object') {
    return;
  }
  const rawImages = status.asic.dmd.videoRam;

  for (var i = 0; i < 16; i++) {
    const frame = rawImages[i];
    const lowerHalfFrame = Uint8Array.from(frame).slice(0, frame.length/2)
    //const upperHalfFrame = Uint8Array.from(frame).slice(frame.length/2)
    const isNotEmpty = frame.find((color) => color > 0);

    const checksum1 = crypto
      .createHash('md5')
      .update(lowerHalfFrame)
      .digest('hex');
    /*const checksum2 = crypto
      .createHash('md5')
      .update(upperHalfFrame)
      .digest('hex');*/
    const imageHasBeenAdded = imgChecksum.has(checksum1);// || imgChecksum.has(checksum2);

    if (isNotEmpty && !imageHasBeenAdded) {
      addedImages++;
      if (addedImages > dmdFramesTotal) {
        const image = canvas.toBuffer();
        const filename = wpcGameEntry.name
          .replace(/\s/g, '_')
          .replace(':', '') +
          '_' + Date.now() + '.png';
        fs.writeFileSync(filename, image);
        console.log('ALL GOOD. BYE', filename);
        process.exit(0);
      }
      debug('ADD_IMAGE', addedImages);
      imgChecksum.add(checksum1);
      //imgChecksum.add(checksum2);
      drawDmd(ctx, frame, xpos, ypos, TEMPLATE.dmdFrameWidth);
      xpos += dmdFrameWidthMargin;
      if (xpos > (canvasWidth - TEMPLATE.margin)) {
        xpos = TEMPLATE.margin;
        ypos += dmdFrameHeightMargin;
      }
    }
  }
}

function ripDmdFrames() {
  return loadFile(romU06Path)
    .then((romFile) => {
      const romData = {
        u06: romFile,
      };
      debug('INIT GAME', wpcGameEntry.name);
      return Emulator.initVMwithRom(romData, wpcGameEntry);
    })
    .then((wpcSystem) => {
      wpcSystem.start();

      boot(wpcSystem);

      const gameMemoryPositionSupportsCurrentScreen = getGameMemoryValue(wpcSystem.getUiState(), 'GAME_CURRENT_SCREEN');
      if (gameMemoryPositionSupportsCurrentScreen === undefined) {
        console.error('NO GAME_CURRENT_SCREEN defined, exit!')
        //  process.exit(1);
      }

      //MAIN LOOP
      debug('MAIN LOOP');

      for (let x = 0; ypos < 29999; x++) {
        if (x % 50 === 0) {
          debug('round', {x, ypos, baseName, addedImages});
        }
        if (x % 2000 === 1999) {
          debug('RE-ARM');
          boot(wpcSystem);
        }

        try {
          const cycles = parseInt(HALF_SECOND_TICKS*2+HALF_SECOND_TICKS * Math.random(), 10);
          wpcSystem.executeCycle(cycles, CPU_STEPS);

          state = wpcSystem.getUiState();
          currentScreen = getGameMemoryValue(state, 'GAME_CURRENT_SCREEN');

          //GAME_RUNNING
          gameIsRunning = getGameMemoryValue(state, 'GAME_RUNNING');
          if (!gameIsRunning) {
            //probably in attract mode
            gameNotRunningcount++;
            if (gameNotRunningcount > 20) {
              debug('try to start the game..');
              addCreditsAndStartGame(wpcSystem);
              gameNotRunningcount = 0;
            }
          }
        } catch (msg) {
          console.error(msg);
        }

        if (lastScreen === currentScreen) {
          debug('no screen change!', lastScreen)
          //continue;
        }
        lastScreen = currentScreen;

        if (gameIsRunning === true && currentScreen < 2) {
          debug('running and screen 0')
          continue;
        }
        extractDmdFramesAndEventuallyQuit(state);

        const stat = wpcSystem.getState();
        if (stat.asic.display.dmdShadedBuffer) {
          consoleOutDmd(stat);
        }

        for (let i = 0; i < 512; i++) {
//        for (let i = 0; i < 128; i++) {
            try {
            let input = parseInt(11 + (Math.random() * 77), 10);
            if (switchBlacklist.includes(input)) {
              input = 13;
            }
            wpcSystem.setSwitchInput(input);
            wpcSystem.executeCycle(KEYPRESS_TICKS, CPU_STEPS);
            extractDmdFramesAndEventuallyQuit(wpcSystem.getUiState());

            if (Math.random() > 0.4) {
              wpcSystem.setSwitchInput(input);
              wpcSystem.executeCycle(KEYPRESS_TICKS, CPU_STEPS);
              extractDmdFramesAndEventuallyQuit(wpcSystem.getUiState());
            }
          } catch (error) {}
        }
      }

      console.log('BYE');
    });
}

function getGameMemoryValue(state, name) {
  //console.log('getGameMemoryValue',name)
  if (!state || !state.asic || !state.asic.memoryPosition) {
    console.error(name + '_EMPTY');
    return;
  }

  const entry = state.asic.memoryPosition
    .find((value) => {
      return value.name === name;
    })

  if (!entry) {
    console.error(name + '_NOT_FOUND');
    return
  }

  return entry.value;
}

function consoleOutDmd(stat) {
  let s = '';
  stat.asic.display.dmdShadedBuffer.forEach((char, index) => {
    switch (char) {
      case 0: s += ' ';
        break;
      case 1: s += '.';
        break;
      case 2: s += '*';
        break;
      case 3: s += '#';
        break;
    }

    if (index % 128 === 0) {
      debug(s);
      s = '';
    }
  });
}

function boot(wpcSystem) {
  if (ramState) {
    wpcSystem.setState(ramState);
    extractDmdFramesAndEventuallyQuit(wpcSystem.getUiState());
    return;
  }

  wpcSystem.reset();
  wpcSystem.executeCycle(15000000, CPU_STEPS);
  extractDmdFramesAndEventuallyQuit(wpcSystem.getUiState());

  console.log('SWITCH enable');
  const switchesEnabled = wpcGameEntry.initialise.closedSwitches;
  switchesEnabled.forEach((a) => {
    console.log(' >enable',a);
    if (Number.isInteger(a)) {
      wpcSystem.setSwitchInput(a);
    } else {
      wpcSystem.setFliptronicsInput(a);
    }
    console.log('IS', wpcSystem.getUiState().asic.wpc.inputState);
  });

  wpcSystem.reset();
  wpcSystem.executeCycle(16000000, CPU_STEPS);
  //extractDmdFramesAndEventuallyQuit(wpcSystem.getUiState());
  wpcSystem.setCabinetInput(2);

  addCreditsAndStartGame(wpcSystem);

  debug('BOOT FINISHED');
}

function addCreditsAndStartGame(wpcSystem) {
  //press ESC
  wpcSystem.setCabinetInput(16);
  wpcSystem.executeCycle(10, CPU_STEPS);

  //add credits
  wpcSystem.setCabinetInput(1);
  wpcSystem.executeCycle(10, CPU_STEPS);
  wpcSystem.setCabinetInput(2);
  wpcSystem.executeCycle(10, CPU_STEPS);
  wpcSystem.setCabinetInput(4);
  wpcSystem.executeCycle(1000000, CPU_STEPS);
  wpcSystem.setCabinetInput(2);
  //extractDmdFramesAndEventuallyQuit(wpcSystem.getUiState());

  //Press Start game
  wpcSystem.setSwitchInput(11);
  wpcSystem.setSwitchInput(13);
  wpcSystem.executeCycle(200000, CPU_STEPS);
  //extractDmdFramesAndEventuallyQuit(wpcSystem.getUiState());

  wpcSystem.setSwitchInput(13);
  wpcSystem.setSwitchInput(11);
  wpcSystem.executeCycle(4000000, CPU_STEPS);
  //extractDmdFramesAndEventuallyQuit(wpcSystem.getUiState());

//  console.log(wpcSystem.getUiState().asic.memoryPosition)
}

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

//IN: hex color as string, like '#DD713E'
//OUT: modified color, R/G/B could be modified by amount
//and maybe uint8 might be a better datatype yes..
function alternateColor(hexColor, amount) {
  const colorValue = parseInt(hexColor.replace('#',''), 16);
  let r = colorValue & 0xFF;
  let g = (colorValue >> 8) & 0xFF;
  let b = (colorValue >> 16) & 0xFF;

  const valueToAdd = parseInt(Math.random() * amount + 0.5, 10) - parseInt(amount / 2, 10);
  r += valueToAdd;
  g += valueToAdd;
  b += valueToAdd;

  if (r < 0) r = 0;
  if (b < 0) b = 0;
  if (g < 0) g = 0;
  if (r > 255) r = 255;
  if (b > 255) b = 255;
  if (g > 255) g = 255;

  return '#' +
    b.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    r.toString(16).padStart(2, '0');
}
