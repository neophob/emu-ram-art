'use strict';

const a3 = {
  widthScaleFactor: 2,

  //thats the A3 format, 300dpi, should make a nice poster
  imageWidth: 3508,
  imageHeight: 4960,

  initialXOffset: 93,
  diagramHeight: 80,
  diagramValueMaxHeight: 64,
  borderSize: 64,
  diagramWidth: 500 / 2,

  maximalFlatLineFactor: 0.5,

  //diagram style
  backgroundFillStyle: 'rgba(237,236,234, 1)',
  lineWidth: 3,
  strokeStyle: '#000000',
  lineJoin: 'round',
};

module.exports = {
  a3
};
