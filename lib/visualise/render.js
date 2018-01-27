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

function render(data, config, renderMetaData) {
  const alignedData = [];
  const emptyDiagram = new Array(data[0].length).fill(0);
  for (let i=0; i<360; i++) {
    alignedData.push(emptyDiagram);
  }
  const filteredMemory = data.concat(alignedData);
  filteredMemory[359] = emptyDiagram;

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
  ctx.fillStyle = config.fontFillStyle;
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
