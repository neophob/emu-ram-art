'use strict';

const fs = require('fs');
const lib = require('./lib');
const render = require('./render');
const path = require('path');
const configObject = require('./config');

const NES_FRAMES_PER_SECOND = 60;

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Parameter [JSON PATH]');
  process.exit(1);
}

const config = process.argv[3]
  ? configObject[process.argv[3]] : configObject.a3dpi1200_WHITE;

if (!config) {
  console.error('INVALID CONFIG', process.argv[3]);
  process.exit(2);
}

console.log('EMU-RAM-ART :: Ram History Visualizer, input:', jsonPath);
const inputData = fs.readFileSync(jsonPath);
console.log('>>build model, config:', config.name);
const { filteredData, metaData } = lib.buildModel(inputData);
console.log('>>split up data and filter entires, dataset length:', filteredData.length, metaData);

if (!metaData.filename) {
  const regexMatch = path.basename(jsonPath).match(/dump-(.+\.nes).*/);
  const filenameToDisplay = regexMatch && regexMatch.length > 0 ?
    regexMatch[1]
      .replace('.nes', '')
      .replace('ZZZ_UNK_', '')
      .replace(/\(.*\)\s/, '')
      .trim() :
    path.basename(jsonPath);
  metaData.filename = filenameToDisplay
}
if (!metaData.framesPerSecond) {
  metaData.framesPerSecond = NES_FRAMES_PER_SECOND;
}

drawDiagram(config, filteredData, metaData);

function drawDiagram(config, filteredData, metaData) {
  let offset = 0;
  const loopLength = Math.floor(filteredData[0].length / config.diagramWidth);
  for (let i = 0; i < loopLength; i++) {
    const dataWindow = filteredData.map((entry) => {
      return entry.slice(offset, offset + config.diagramWidth);
    });

    console.log('>>offset', offset);

    const correctAmountOfFilteredData = lib.filterSlots(dataWindow, config.maximalFlatLineFactor);
    console.log('>>interesting diagrams found:', correctAmountOfFilteredData.length);
    if (correctAmountOfFilteredData.length > config.neededDataSets) {
      const filename = path.basename(jsonPath) + `_${offset}_${config.diagramWidth}_${config.name}.png`;
      console.log('>>render image', filename);
      const duration = roundToOneDecimal(config.diagramWidth / metaData.framesPerSecond);
      const durationText = duration + ' seconds';
      render.render(correctAmountOfFilteredData, config,
        { filename, filenameToDisplay: metaData.filename, durationText });
    } else {
      console.log('No need to create image...');
    }

    offset += config.diagramWidth;
  }
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}
