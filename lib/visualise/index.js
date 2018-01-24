'use strict';

const fs = require('fs');
const lib = require('./lib');
const render = require('./render');
const path = require('path');
const configObject = require('./config');

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Parameter [JSON PATH]');
  process.exit(1);
}

console.log('EMU-RAM-ART :: Visualiser, input:', jsonPath);
const inputData = fs.readFileSync(jsonPath);
console.log('>>build model');
const filteredData = lib.buildModel(inputData);
console.log('>>split up data and filter entires, dataset length:', filteredData.length);

drawDiagram(configObject.a3, filteredData);

function drawDiagram(config, filteredData) {
  let offset = 0;
  const loopLength = Math.floor(filteredData.length / config.diagramWidth);
  for (let i = 0; i < loopLength; i++) {
    const dataWindow = filteredData.map((entry) => {
      return entry.slice(offset, offset + config.diagramWidth);
    });

    console.log('>>offset', offset);

    const slotSize = config.diagramWidth / config.widthScaleFactor;
    const correctAmountOfFilteredData = lib.filterSlots(dataWindow, slotSize, 0, config.maximalFlatLineFactor);
    console.log('>>interesting diagrams found:', correctAmountOfFilteredData.length);
    if (correctAmountOfFilteredData.length > 5) {
      console.log('>>render image');
      const filename = path.basename(jsonPath) + '_' + offset + '.png';
      const filenameToDisplay = path.basename(jsonPath).match(/dump-(.+\.nes).*/)[1];
      console.log('filenameToDisplay',filenameToDisplay);
      const startTime = roundToOneDecimal(offset / 60);
      const duration = roundToOneDecimal(config.diagramWidth / 60);
      const headerText = '// capture start at ' + startTime + ' seconds // snapshot duration is ' + duration + ' seconds';
      render.render(correctAmountOfFilteredData, config, { filename, filenameToDisplay, headerText });
    } else {
      console.log('No need to create image... Bail out now.');
    }

    offset += config.diagramWidth;
  }
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}
