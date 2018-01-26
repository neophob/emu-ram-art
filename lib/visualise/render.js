'use strict';

const { registerFont, createCanvas } = require('canvas');
const fs = require('fs');
const debug = require('debug')('visualise:render');

const fontpath = __dirname + '/../../resources/SpaceMono-Regular.ttf';
debug('register font', fontpath);
registerFont(fontpath, { family: 'sans-serif' });

module.exports = {
  render,
};

function render(filteredMemory, config, renderMetaData) {
  const initialYPos = config.borderSize + config.diagramHeight;
  let count = 0;
  const canvas = createCanvas(config.imageWidth, config.imageHeight);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = config.backgroundFillStyle;
  ctx.fillRect(0, 0, config.imageWidth, config.imageHeight);

  ctx.imageSmoothingEnabled = true;
  ctx.lineWidth = config.lineWidth;
  ctx.strokeStyle = config.strokeStyle;
  ctx.lineJoin = config.lineJoin;

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
      ctx.moveTo(x, y + (config.diagramValueMaxHeight - frame[0] >> config.shr));
      for (let i=0; i<frame.length; i++) {
        ctx.lineTo(x + i * config.widthScaleFactor, y + (config.diagramValueMaxHeight - frame[i] >> config.shr));
        ctx.moveTo(x + i * config.widthScaleFactor, y + (config.diagramValueMaxHeight - frame[i] >> config.shr));
      }
      ctx.stroke();
      count++;

      y += config.diagramHeight;
      if (y >= (config.imageHeight - config.borderSize)) {
        y = initialYPos;
        x += frame.length * config.widthScaleFactor + config.borderSize;
        if (x >= (config.imageWidth - config.diagramWidth)) {
          done = true;
        }
      }
    });

  // write rom infos
  ctx.font = config.fontSize + 'px sans-serif';
  ctx.textBaseline = 'hanging';
  const textXpos = (x >= (config.imageWidth - config.diagramWidth)) ? x - config.diagramWidth * config.widthScaleFactor - config.borderSize : x;
  ctx.fillRect(
    textXpos - 5,
    config.imageHeight - config.borderSize - (config.diagramHeight - config.diagramValueMaxHeight) - config.diagramHeight,
    config.diagramWidth * config.widthScaleFactor + 5,
    config.diagramHeight * 2
  );
  ctx.fillStyle = config.fontFillStyle;
  ctx.beginPath();
  y = config.imageHeight - config.borderSize - (config.diagramHeight - config.diagramValueMaxHeight) + 50;
  ctx.moveTo(textXpos, y);
  ctx.lineTo(textXpos + filteredMemory[0].length * config.widthScaleFactor, y);
  ctx.stroke();

  ctx.fillText(
    renderMetaData.filenameToDisplay,
    textXpos,
    config.imageHeight - config.borderSize - 170
  );
  ctx.fillText(
    renderMetaData.durationText,
    textXpos,
    config.imageHeight - config.borderSize - 120
  );

  debug('start export image...');
  const image = canvas.toBuffer();
  fs.writeFileSync(renderMetaData.filename, image);
}
