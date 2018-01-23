'use strict';

const path = require('path');
const PImage = require('pureimage');
const fs = require('fs');
const config = require('./config');
const debug = require('debug')('visualise:render');

module.exports = {
  render,
};


function render(filteredMemory, jsonPath) {
  let count = 0;
  const image = PImage.make(config.imageWidth, config.imageHeight);
  var ctx = image.getContext('2d');
  ctx.fillStyle = config.backgroundFillStyle;
  ctx.fillRect(0, 0, config.imageWidth, config.imageHeight);

  ctx.lineWidth = config.lineWidth;
  ctx.strokeStyle = config.strokeStyle;
  ctx.lineJoin = config.lineJoin;
  ctx.imageSmoothingEnabled = true;

  let x=104;
  let y=config.borderSize;
  let done = false;
  filteredMemory
    .forEach((frame) => {
      if (done) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(x, y+(config.diagramValueMaxHeight-frame[0]>>2));
      for (let i=0; i<frame.length; i++) {
        ctx.lineTo(x+i*config.X_SCALE, y+(config.diagramValueMaxHeight-frame[i]>>2));
        ctx.moveTo(x+i*config.X_SCALE, y+(config.diagramValueMaxHeight-frame[i]>>2));
      }
      ctx.stroke();

      count ++;

      y += config.diagramHeight;
      if ((y + config.diagramHeight) > config.imageHeight) {
        y = config.borderSize;
        x += frame.length*config.X_SCALE + config.borderSize;
        if (x>(config.imageWidth-560)) {
          done = true;
        }
      }
    });

  const filename = path.basename(jsonPath) + '.png' ;
  debug('start export image...');
  PImage.encodePNGToStream(image, fs.createWriteStream(filename)).then(() => {
    debug('wrote file', filename, count);
  }).catch((e)=>{
    debug('there was an error writing', e.message);
  });
}