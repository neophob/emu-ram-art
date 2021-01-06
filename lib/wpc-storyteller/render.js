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

let lastTiming;

function render(col, flags) {
  const canvas = createCanvas(config.imageWidth, config.imageHeight);
  const ctx = canvas.getContext('2d');

  const blockSize = config.blockSize;

  let xOfs = config.xOfs;
  let yOfs = config.yOfs;

  ctx.font = '12px Space Mono';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = config.borderStyle;
  ctx.fillRect(0, 0, config.imageWidth, config.imageHeight);

  //show palette on top
  for (let i=0; i<8; i++) {
    ctx.fillStyle = col[i];
    ctx.fillRect(xOfs + blockSize*i, yOfs - blockSize/2, blockSize, blockSize/4);
  }
  ctx.fillText('Condition Code Register Map', xOfs+200, yOfs - blockSize/2);

  // loop for each register (aka bit)
  for (let i=0; i<8; i++) {
    xOfs = config.xOfs;
    yOfs = config.yOfs;
    const mask = 1 << (7-i);
    let isOpen = false;

    flags.forEach((entry, index) => {
      const value = entry.cc;
      const previousValue = index > 0 ? flags[index - 1].cc : 0;
      const nextValue = index < (flags.length - 1) ? flags[index + 1].cc : 0;

      const isBitSet = (value & mask) > 0;
      const isPreviousLineBitSet = (previousValue & mask) > 0;
      const isNextLineBitSet = (nextValue & mask) > 0;

      if (isBitSet) {
        ctx.fillStyle = col[i];

        if (isOpen || isPreviousLineBitSet) {
          if (isPreviousLineBitSet && !isNextLineBitSet) {
            drawLeftClosingArc(ctx, xOfs +blockSize+blockSize*i, yOfs, blockSize);
          } else {
            if (isOpen && !isPreviousLineBitSet) {
              drawLeftOpeningArc(ctx, xOfs + blockSize+blockSize*i, yOfs, blockSize);
              ctx.fillRect(xOfs + blockSize*(i+1), yOfs, blockSize*(7-i), blockSize);
            } else {
              ctx.fillRect(xOfs + blockSize*i, yOfs, blockSize, blockSize);
            }
            isOpen = true;
          }
        } else {
          //the first left arc
          if (isNextLineBitSet) {
            drawLeftOpeningArc(ctx, xOfs + blockSize+blockSize*i, yOfs, blockSize);
            ctx.fillRect(xOfs + blockSize*(i+1), yOfs, blockSize*(7-i), blockSize);
          } else {
            ctx.fillRect(xOfs + blockSize*i, yOfs, blockSize*(7-i), blockSize);
          }
          isOpen = true;
        }
      }

      if (i==7) {
        const cr = (value).toString(2);
        const lsb = (cr.length - cr.lastIndexOf('1')) % 8;
        const ofs = lsb > 0 ? lsb-1 : 7;
        ctx.fillStyle = col[lsb].value;

        const timing = '' + parseInt(entry.ticks/20000)/100 + 's';
        if (timing !== lastTiming && value) {
          ctx.fillText(timing, xOfs+125, yOfs + blockSize/2);
          lastTiming = timing;
        }
      }

      yOfs += blockSize;
      if (index % config.entriesY === (config.entriesY - 1)) {
        xOfs += config.xOfsAdd;
        yOfs = config.yOfs;
      }
    });

  }

  debug('start export image...');
  const image = canvas.toBuffer();
  fs.writeFileSync('out.png', image);
}


function drawLeftClosingArc(ctx, x, y, blockSize) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, blockSize, 90*(Math.PI/180), 180*(Math.PI/180));
  ctx.fill();
}

function drawLeftOpeningArc(ctx, x, y, blockSize) {
  y+=blockSize;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, blockSize, 180*(Math.PI/180), 270*(Math.PI/180));
  ctx.fill();
}


const config = {
  imageWidth: 14032,
  imageHeight: 19842,

  blockSize: 135,
  xOfs: 800,
  yOfs: 800,

  xOfsAdd: 1630,

  entriesY: 135,

  borderStyle: 'rgba(0,0,0, 1)',
};