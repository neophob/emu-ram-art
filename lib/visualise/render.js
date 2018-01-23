'use strict';

const path = require('path');
const PImage = require('pureimage');
const fs = require('fs');
const config = require('./config');

module.exports = {
  render,
};

function render(filteredMemory, jsonPath) {
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
        ctx.lineTo(x+i*config.X_SCALE, y+(64-frame[i]>>2));
        ctx.moveTo(x+i*config.X_SCALE, y+(64-frame[i]>>2));
      }
      ctx.stroke();

      count ++;

      y += 80;
      if ((y + 80) > 4961) {
        y = BORDER;
        x += frame.length*config.X_SCALE + BORDER;
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
