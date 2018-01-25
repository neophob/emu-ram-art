'use strict';

const debug = require('debug')('visualise:lib');
const crypto = require('crypto');

module.exports = {
  buildModel,
  filterSlots,
};

/**
 * builds the model from a flat (sequential) memory dump
 * @function
 * @param {Object} inputData sequental ram dump
 * @return {Array} aligned ram data
 * @example
 *  input data:
 *  [{
 *    'frame':0,
 *    'mainMemory':'0,6,5'
 *  },
 *  {
 *    'frame':1,
 *    'mainMemory':'0,2,4'
 *  }];
 *
 * output data:
 * [
 *  [0, 0],
 *  [6, 2],
 *  [5, 4]
 * ]
 */
function buildModel(inputData) {
  const data = JSON.parse(inputData);
  const mainMemory = [];

  //convert 0: 200,201 1: 111,221 ..
  let memory = data.map((element) => {
    return element.mainMemory.split(',')
      .map((e) => parseInt(e));
  });
  debug('dataset size:', memory.length);

  //split - use reduce?
  memory.forEach((frameMemory) => {
    frameMemory.forEach((memory, index) => {
      if (mainMemory[index] === undefined) {
        mainMemory[index] = [];
      }
      mainMemory[index].push(memory);
    });
  });
  debug('condensed memory size',memory.length);
  memory = null;

  //filter
  debug('initial value', mainMemory.length);
  return mainMemory;
}


/**
 * split large junk into pieces of slotSize frames, removes duplicate slots and filter out flatline slots
 * @function
 * @param {Array} data the ram content as array
 * @param {Integer} slotSize split input data in this amount of slots
 * @param {Integer} offset initial offset of the data array
 * @param {Float} maximalFlatlineFactor if the slot contains more than maximalFlatlineFactor (between 0 and 1) flat lines, the slot is filtered out
 * @return {Array} split array
 */
function filterSlots(data, slotSize, offset, maximalFlatlineFactor) {
  if (!data || !Number.isInteger(slotSize) || !Number.isInteger(offset) || !maximalFlatlineFactor) {
    debug('passed parameter %o', { slotSize, offset, maximalFlatlineFactor });
    throw new Error('INVALID_PARAMETER');
  }
  const tmp = [];
  debug('concat size', data.length);

  return data
    .filter((frameMemory) => {
      debug('%o',frameMemory);
      const sha256 = crypto.createHash('sha256').update(frameMemory.toString()).digest('hex');
      if (tmp.includes(sha256)) {
        return;
      }
      tmp.push(sha256);
      return true;
    })
    .filter((frameMemory) => {
      let maxFlatLineLength = 0;
      let currentFlatLineLength = 0;
      let lastValue = -1;
      frameMemory.forEach((e) => {
        if (Math.abs(lastValue-e) < 8) {
          currentFlatLineLength++;
        } else {
          maxFlatLineLength = Math.max(maxFlatLineLength, currentFlatLineLength);
          currentFlatLineLength = 0;
        }
        lastValue = e;
      });
      maxFlatLineLength = Math.max(maxFlatLineLength, currentFlatLineLength);
      debug('maxFlatLineLength', maxFlatLineLength, 'required', frameMemory.length * maximalFlatlineFactor);
      return parseInt(frameMemory.length * maximalFlatlineFactor) >= maxFlatLineLength;
    });
}
