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
console.log('build model');
const filteredData = lib.buildModel(inputData);
console.log('fill slots', filteredData.length);
const correctAmountOfFilteredData = lib.fillSlots(filteredData, 1200/config.X_SCALE, 400);
console.log('draw', correctAmountOfFilteredData.length);
render.render(correctAmountOfFilteredData, jsonPath);
