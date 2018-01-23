'use strict';

const debug = require('debug')('visualise:lib');
const crypto = require('crypto');

module.exports = {
  buildModel,
  fillSlots,
};

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


// split large junk into pieces of 500 frames
function fillSlots(data, size, offset) {
  const tmp = [];

  function sliceData(offset, length) {
    return data.map((entry) => {
      return entry.slice(offset, offset+length);
    });
  }

  let result = sliceData(offset, size);
  for (let i=0; i<Math.floor(data/size); i++) {
    offset+=size;
    result = result.concat(sliceData(offset, size));
  }

  debug('concat size',result.length);

  return result
    .filter((frameMemory) => {
      const sha256 = crypto.createHash('sha256').update(frameMemory.toString()).digest('hex');
      if (tmp.includes(sha256)) {
        return;
      }
      tmp.push(sha256);
      return true;
    })
    .filter((frameMemory) => {
      let maxStraightLine = 0;
      let straightLine = 0;
      let lastValue = -1;
      frameMemory.forEach((e) => {
        if (lastValue === e) {
          straightLine++;
        } else {
          maxStraightLine = Math.max(maxStraightLine, straightLine);
          straightLine = 0;
        }
        lastValue = e;
      });
      maxStraightLine = Math.max(maxStraightLine, straightLine);
    /*  const initialValue = frameMemory[0];
      const a = frameMemory.reduce((result, element) => {
        return result + (element === initialValue) ? 0 : 1;
      }, 0);*/

      debug(maxStraightLine, frameMemory.toString());
      return maxStraightLine !== frameMemory.length;
    });
}
