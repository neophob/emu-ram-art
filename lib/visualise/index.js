'use strict';

const fs = require('fs');
const path = require('path');
const PImage = require('pureimage');
const crypto = require('crypto');

function buildModel(inputData) {
  const data = JSON.parse(inputData);
  const mainMemory = [];

  //convert 0: 200,201 1: 111,221 ..
  let memory = data.map((element) => {
    return element.mainMemory.split(',')
      .map((e) => parseInt(e));
  });
  console.log('dataset size:', memory.length);

  //split - use reduce?
  memory.forEach((frameMemory) => {
    frameMemory.forEach((memory, index) => {
      if (mainMemory[index] === undefined) {
        mainMemory[index] = [];
      }
      mainMemory[index].push(memory);
    });
  });
  console.log('condensed memory size',memory.length);
  memory = null;

  //filter
  console.log('initial value', mainMemory.length);
  return mainMemory;
}
const X_SCALE = 1;


function drawHuge(filteredMemory) {
  let count = 0;
  const image = PImage.make(3508, 4961);
  var ctx = image.getContext('2d');
  ctx.fillStyle = 'rgba(237,236,234, 1)';
  ctx.fillRect(0,0,3508, 4961);

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000000';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;

  const BORDER = 64;

  let x=104;
  let y=BORDER;
  let done = false;
  filteredMemory
    .forEach((frame) => {
      if (done) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(x, y+(64-frame[0]>>2));
      for (let i=0; i<frame.length; i++) {
        ctx.lineTo(x+i*X_SCALE, y+(64-frame[i]>>2));
        ctx.moveTo(x+i*X_SCALE, y+(64-frame[i]>>2));
      }
      ctx.stroke();

      count ++;

      y += 80;
      if ((y + 80) > 4961) {
        y = BORDER;
        x += frame.length*X_SCALE + BORDER;
        if (x>(3508-560)) {
          done=true;
        }
      }
    });

  const filename = path.basename(jsonPath) + '.png' ;
  console.log('start export image...');
  PImage.encodePNGToStream(image, fs.createWriteStream(filename)).then(() => {
    console.log('wrote file', filename, count);
  }).catch((e)=>{
    console.log('there was an error writing', e.message);
  });
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

console.log('concat size',result.length);

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

      console.log(maxStraightLine, frameMemory.toString());
      return maxStraightLine !== frameMemory.length;
    });
}

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Parameter [JSON PATH]');
  process.exit(1);
}
console.log(jsonPath);
const inputData = fs.readFileSync(jsonPath);
console.log('build model');
const filteredData = buildModel(inputData);
console.log('fill slots', filteredData.length);
const correctAmountOfFilteredData = fillSlots(filteredData, 1200/X_SCALE, 400);
console.log('draw', correctAmountOfFilteredData.length);
drawHuge(correctAmountOfFilteredData);
