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
  ctx.strokeStyle = NESPAL[palIndex++];
  ctx.fillStyle = ctx.strokeStyle;
  const diagWidth = config.diagramWidth * config.widthScaleFactor;
  ctx.fillRect(x, config.imageHeight - config.initialXOffset, diagWidth, config.diagramHeight / 8);
//  ctx.fillRect(x, config.initialXOffset + config.diagramHeight/2, diagWidth, config.diagramHeight / 8);

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
      if (y >= (config.imageHeight - config.initialXOffset - config.diagramHeight)) {
        y = initialYPos;
        ctx.fillRect(x, config.imageHeight - config.initialXOffset, diagWidth, config.diagramHeight / 8);
        //ctx.fillRect(x, config.initialXOffset + config.diagramHeight/2, diagWidth, config.diagramHeight / 8);

        ctx.strokeStyle = NESPAL[palIndex++];
        ctx.fillStyle = ctx.strokeStyle;
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
/*  ctx.fillText(
    'Nintendo Entertainment System',
    config.initialXOffset + 4 * (config.diagramWidth + config.borderSize),
    config.initialXOffset - config.fontSize
  );*/

  debug('start export image...');
  const image = canvas.toBuffer();
  fs.writeFileSync(renderMetaData.filename, image);
}

//source: http://www.thealmightyguru.com/Games/Hacking/Wiki/index.php/NES_Palette
const NESPAL = [
/*  '#7C7C7C',
  '#4428BC',
  '#940084',
  '#A80020',
  '#A81000',
  '#881400',
  '#503000',
  '#007800',
  '#006800',
  '#005800',
  '#004058',
  '#BCBCBC',
  '#0078F8',
  '#0058F8',
  '#6844FC',
  '#D800CC',
  '#E40058',
  '#F83800',
  '#E45C10',
  '#AC7C00',
  '#00B800',
  '#00A800',
  '#00A844',
  '#008888',
  '#F8F8F8',
  '#3CBCFC',
  '#6888FC',
  '#9878F8',
  '#F878F8',
  '#F85898',
  '#F87858',
  '#FCA044',
  '#F8B800',
  '#B8F818',
  '#58D854',
  '#58F898',
  '#00E8D8',
  '#787878',*/
  '#FCFCFC',
  '#A4E4FC',
  '#B8B8F8',
  '#D8B8F8',
  '#F8B8F8',
  '#F8A4C0',
  '#F0D0B0',
  '#FCE0A8',
  '#F8D878',
  '#D8F878',
  '#B8F8B8',
  '#B8F8D8',
  '#00FCFC',
  '#F8D8F8',
];