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
  for (let i=0; i < 360; i++) {
    alignedData.push(emptyDiagram);
  }
  const filteredMemory = data.concat(alignedData);

  const initialYPos = config.initialXOffset + config.diagramHeight;
  let count = 0;
  const canvas = createCanvas(config.imageWidth, config.imageHeight);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = config.borderStyle;
  ctx.fillRect(0, 0, config.imageWidth, config.imageHeight);

  const BORDER_SIZE = 20;
  ctx.fillStyle = config.backgroundFillStyle;
  ctx.fillRect(BORDER_SIZE, BORDER_SIZE, config.imageWidth - 2 * BORDER_SIZE, config.imageHeight - 2 * BORDER_SIZE);

  ctx.imageSmoothingEnabled = true;
  ctx.lineWidth = config.lineWidth;
  ctx.lineJoin = config.lineJoin;
  ctx.strokeStyle = config.strokeStyle;

  let x = config.initialXOffset;
  let y = initialYPos;
  let done = false;

  let palIndex = 0;
  ctx.strokeStyle = config.palette[palIndex++];
  ctx.fillStyle = ctx.strokeStyle;
  const diagWidth = config.diagramWidth * config.widthScaleFactor;
  ctx.fillRect(x, config.imageHeight - config.initialXOffset, diagWidth, config.diagramHeight / 8);

  filteredMemory
    .forEach((frame) => {
      /*jslint bitwise: true */
      if (done) {
        return;
      }

      if (config.rainbow === true) {
        palIndex = (palIndex + 1) % (config.palette.length -1);
        ctx.strokeStyle = config.palette[palIndex];
        ctx.fillStyle = ctx.strokeStyle;
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
      if (y >= (config.imageHeight - config.initialXOffset - config.diagramHeight)) {
        y = initialYPos;
        ctx.fillRect(x, config.imageHeight - config.initialXOffset, diagWidth, config.diagramHeight / 8);

        if (config.rainbow !== true) {
          ctx.strokeStyle = config.palette[palIndex++];
          ctx.fillStyle = ctx.strokeStyle;
        }

        x += frame.length * config.widthScaleFactor + config.borderSize;
        if (x >= (config.imageWidth - config.initialXOffset)) {
          done = true;
        }
      }
    });

  // write rom infos
  ctx.font = config.fontSize + 'px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = "center";
  ctx.fillStyle = config.fontFillStyle;
  ctx.fillText(
    renderMetaData.filenameToDisplay + ' - ' + renderMetaData.durationText + ' of childhood memories',
    config.imageWidth / 2,
    config.initialXOffset
  );

  debug('start export image...');
  const image = canvas.toBuffer();
  fs.writeFileSync(renderMetaData.filename, image);
}
