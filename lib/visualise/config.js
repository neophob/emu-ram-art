'use strict';

const a3dpi300 = {
  //thats the A3 format, 300dpi, should make a nice poster
  imageWidth: 3508,
  imageHeight: 4960,

  initialXOffset: (3508 - 5 * (500 + 96) + 96) / 2,
  diagramHeight: 80,
  diagramValueMaxHeight: 64,
  borderSize: 96,

  //widthScaleFactor length of a data point, need to be in sync with diagramWidth
  widthScaleFactor: 1,

  // diagramWidth defines time of a sequence
  diagramWidth: 500 / 1,
  //diagramWidth: 500 / 2,

  //used to reduce height of the diagram
  shr: 2,

  maximalFlatLineFactor: 0.5,

  //diagram style
  boarderStyle: 'rgba(237,0,0, 1)',
  backgroundFillStyle: 'rgba(0,0,0, 1)',
  fontFillStyle: '#eceeec',
  fontSize: 30,
  lineWidth: 3,
  strokeStyle: '#eceeec',
  lineJoin: 'round',
};

const a3dpi600 = {
  widthScaleFactor: 1,

  //thats the A3 format, 300dpi, should make a nice poster
  imageWidth: 7016,
  imageHeight: 9933,

  initialXOffset: 93*2,
  diagramHeight: 80*2,
  diagramValueMaxHeight: 64,
  borderSize: 64*2,

  diagramWidth: 500 * 2,
  shr: 1,

  maximalFlatLineFactor: 0.5,

  //diagram style
  backgroundFillStyle: 'rgba(237,236,234, 1)',
  fontFillStyle: '#000',
  fontSize: 40,
  lineWidth: 4,
  strokeStyle: '#000000',
  lineJoin: 'round',
};

const a3dpi1200 = {
  widthScaleFactor: 2,

  //thats the A3 format, 300dpi, should make a nice poster
  imageWidth: 14032,
  imageHeight: 19842,

  initialXOffset: 93*4,
  diagramHeight: 80*4,
  diagramValueMaxHeight: 64*4,
  borderSize: 64*4,

  diagramWidth: 500 * 2,
  shr: 0,

  maximalFlatLineFactor: 0.5,

  //diagram style
  backgroundFillStyle: 'rgba(237,236,234, 1)',
  fontFillStyle: '#000',
  fontSize: 70,
  lineWidth: 5,
  strokeStyle: '#000000',
  lineJoin: 'round',
};

module.exports = {
  a3dpi300,
  a3dpi600,
  a3dpi1200,
};
