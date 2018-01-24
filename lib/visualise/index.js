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

// TODO move to render

const config = configObject.a3;
let offset = 0;
const loopLength = Math.floor(filteredData.length/config.diagramWidth);
for (let i = 0; i < loopLength; i++) {
  const dataWindow = sliceData(filteredData, offset, config.diagramWidth);
  console.log('>>offset', offset);

  const slotSize = config.diagramWidth / config.widthScaleFactor;
  const correctAmountOfFilteredData = lib.filterSlots(dataWindow, slotSize, 0, config.maximalFlatLineFactor);
  console.log('>>interesting diagrams found:', correctAmountOfFilteredData.length);
  if (correctAmountOfFilteredData.length) {
    console.log('>>render image');
    const filename = path.basename(jsonPath) + '_' + offset + '.png';
    const headerText = 'offset: ' + offset + ', duration: ' + config.diagramWidth + ' frames';
    render.render(correctAmountOfFilteredData, config, { filename, headerText });
  } else {
    console.log('No need to create image... Bail out now.');
  }

  offset += config.diagramWidth;
}

function sliceData(data, offset, length) {
  return data.map((entry) => {
    return entry.slice(offset, offset+length);
  });
}
