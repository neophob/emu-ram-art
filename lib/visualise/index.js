'use strict';

const fs = require('fs');
const lib = require('./lib');
const render = require('./render');
const config = require('./config');

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Parameter [JSON PATH]');
  process.exit(1);
}
console.log(jsonPath);
const inputData = fs.readFileSync(jsonPath);
console.log('>>build model');
const filteredData = lib.buildModel(inputData);
console.log('>>split up data and filter entires, dataset length:', filteredData.length);
const cfg = {
  slotSize: 400,
  offset: 400,
  maximalFlatLineFactor: 0.5,
};
const correctAmountOfFilteredData = lib.fillSlots(filteredData, cfg.slotSize, cfg.offset, cfg.maximalFlatLineFactor);
console.log('>>interesting diagrams found:', correctAmountOfFilteredData.length);
if (correctAmountOfFilteredData.length) {
  console.log('>>render image');
  render.render(correctAmountOfFilteredData, jsonPath);
  console.log('EOF');
} else {
  console.log('No need to create image... Bail out now.');
}
