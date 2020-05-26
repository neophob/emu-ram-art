'use strict';

const fs = require('fs');
const lib = require('./lib');
const render = require('./render');
const path = require('path');
const configObject = require('./config');

const NES_FRAMES_PER_SECOND = 60;
const NEEDED_INTERESTING_IMAGES = 270;

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Parameter [JSON PATH]');
  process.exit(1);
}

console.log('EMU-RAM-ART :: Ram History Visualiser, input:', jsonPath);
const inputData = fs.readFileSync(jsonPath);
console.log('>>build model');
const filteredData = lib.buildModel(inputData);
console.log('>>split up data and filter entires, dataset length:', filteredData.length);

//const config = configObject.a3dpi1200;
const config = configObject.a3dpi300;
drawDiagram(config, filteredData);

function drawDiagram(config, filteredData) {
  let offset = 0;
  const loopLength = Math.floor(filteredData[0].length / config.diagramWidth);
  for (let i = 0; i < loopLength; i++) {
    const dataWindow = filteredData.map((entry) => {
      return entry.slice(offset, offset + config.diagramWidth);
    });

    console.log('>>offset', offset);

    const slotSize = config.diagramWidth / config.widthScaleFactor;
    const correctAmountOfFilteredData = lib.filterSlots(dataWindow, slotSize, 0, config.maximalFlatLineFactor);
    console.log('>>interesting diagrams found:', correctAmountOfFilteredData.length);
    if (correctAmountOfFilteredData.length > NEEDED_INTERESTING_IMAGES) {
      const filename = path.basename(jsonPath) + `_${offset}_${config.diagramWidth}.png`;
      console.log('>>render image', filename);
      const regexMatch = path.basename(jsonPath).match(/dump-(.+\.nes).*/);
      const filenameToDisplay = regexMatch && regexMatch.length > 0 ? regexMatch[1] : path.basename(jsonPath);
      const duration = roundToOneDecimal((config.diagramWidth) / NES_FRAMES_PER_SECOND);
      const durationText = duration + ' seconds';
      render.render(correctAmountOfFilteredData, config, { filename, filenameToDisplay, durationText });
    } else {
      console.log('No need to create image...');
    }

    offset += config.diagramWidth;
  }
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}
