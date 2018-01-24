'use strict';

const { registerFont, createCanvas } = require('canvas');
const fs = require('fs');
const debug = require('debug')('visualise:render');

const fontpath = __dirname + '/../../resources/OpenSans-Light.ttf';
debug('register font', fontpath);
registerFont(fontpath, { family: 'sans-serif' });

module.exports = {
  render,
};

function render(filteredMemory, config, renderMetaData) {
  let count = 0;
  const canvas = createCanvas(config.imageWidth, config.imageHeight);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = config.backgroundFillStyle;
  ctx.fillRect(0, 0, config.imageWidth, config.imageHeight);

  ctx.fillStyle = config.fontFillStyle;
  ctx.font = config.fontSize + ' sans-serif';
  const text = renderMetaData.filenameToDisplay + ' ' + renderMetaData.headerText;
  ctx.fillText(text, config.initialXOffset, 50);

  ctx.imageSmoothingEnabled = true;
  ctx.lineWidth = config.lineWidth;
  ctx.strokeStyle = config.strokeStyle;
  ctx.lineJoin = config.lineJoin;

  const initialYPos = config.borderSize + config.diagramHeight;
  let x = config.initialXOffset;
  let y = initialYPos;
  let done = false;
  filteredMemory
    .forEach((frame) => {
      /*jslint bitwise: true */
      if (done) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(x, y + (config.diagramValueMaxHeight-frame[0] >> 2));
      for (let i=0; i<frame.length; i++) {
        ctx.lineTo(x + i * config.widthScaleFactor, y + (config.diagramValueMaxHeight - frame[i] >> 2));
        ctx.moveTo(x + i * config.widthScaleFactor, y + (config.diagramValueMaxHeight - frame[i] >> 2));
      }
      ctx.stroke();
      count++;

      y += config.diagramHeight;
      if (y > (config.imageHeight-config.borderSize)) {
        y = initialYPos;
        x += frame.length * config.widthScaleFactor + config.borderSize;
        if (x > (config.imageWidth - config.diagramWidth)) {
          done = true;
        }
      }
    });

  debug('start export image...');
  const png = canvas.toBuffer();
  fs.writeFileSync(renderMetaData.filename, png);
}
